import { afterEach, expect, test } from "bun:test";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { bin, parseOutput, run } from "../src/blindfolded/analysis/runtime.mjs";
import { storageFor } from "../src/runtime/storage.mjs";
import { typedCoverage } from "../src/blindfolded/analysis/typed-coverage.mjs";

const temporary = [];
afterEach(() => { for (const directory of temporary.splice(0)) rmSync(directory, { recursive: true, force: true }); });

function fixture(source) {
  const root = mkdtempSync(resolve(tmpdir(), "510-capture-test-"));
  temporary.push(root);
  const command = resolve(root, "writer.mjs");
  writeFileSync(command, source);
  return { root, command };
}

function cleaned(root) {
  const directory = storageFor(root).temporary;
  expect(!existsSync(directory) || readdirSync(directory).length === 0).toBe(true);
}

test("capture retains large JSON and stderr when a findings process exits immediately", async () => {
  const f = fixture(`const text = "é😀".repeat(Number(process.argv[2]));
process.stderr.write("diagnostic: " + text);
process.stdout.write(JSON.stringify({ findings: [text], last: "complete" }));
process.exit(1);`);
  for (const length of [150_000, 600_000]) {
    const result = await run(f.command, [String(length)], f.root);
    expect(result.status).toBe(1);
    expect(parseOutput(result, "writer")).toEqual({ findings: ["é😀".repeat(length)], last: "complete" });
    expect(result.stderr).toBe("diagnostic: " + "é😀".repeat(length));
    cleaned(f.root);
  }
});

test("malformed output includes byte counts, stdout tail, and stderr", async () => {
  const f = fixture(`process.stderr.write("retained stderr"); process.stdout.write('x'.repeat(5000) + 'BROKEN-TAIL');`);
  const result = await run(f.command, [], f.root);
  expect(() => parseOutput(result, "writer")).toThrow("BROKEN-TAIL");
  expect(() => parseOutput(result, "writer")).toThrow("retained stderr");
  expect(() => parseOutput(result, "writer")).toThrow("5011 bytes");
  cleaned(f.root);
});

test("capture enforces byte limits on both streams and cleans temporary files", async () => {
  for (const stream of ["stdout", "stderr"]) {
    const f = fixture(`import { writeSync } from "node:fs"; while (true) writeSync(${stream === "stdout" ? 1 : 2}, 'é'.repeat(10000));`);
    await expect(run(f.command, [], f.root, {}, { maxBuffer: 100_000 })).rejects.toThrow(`${stream} exceeded`);
    cleaned(f.root);
  }
});

test("timeouts, signals, launch failures, and cancellation cannot return successful results", async () => {
  const f = fixture(`process.stderr.write("before timeout"); setInterval(() => {}, 100);`);
  await expect(run(f.command, [], f.root, {}, { timeout: 150 })).rejects.toThrow("time limit");
  cleaned(f.root);
  const controller = new AbortController();
  const result = run(f.command, [], f.root, {}, { signal: controller.signal });
  setTimeout(() => controller.abort(), 100);
  await expect(result).rejects.toThrow("cancelled");
  cleaned(f.root);
  await expect(run(f.command, [], f.root, {}, { signal: controller.signal })).rejects.toThrow("cancelled");
  writeFileSync(f.command, `process.kill(process.pid, 'SIGTERM');`);
  await expect(run(f.command, [], f.root)).rejects.toThrow("SIGTERM");
  await expect(run(f.command, [], resolve(f.root, "missing"))).rejects.toThrow();
  cleaned(f.root);
});

test("the pinned Oxlint CLI retains several MiB of diagnostics", async () => {
  const f = fixture("");
  const source = resolve(f.root, "source.ts");
  writeFileSync(source, Array.from({ length: 9000 }, (_, index) => `export const value${index} = missing${index};`).join("\n"));
  const config = resolve(f.root, "oxlint.json");
  writeFileSync(config, JSON.stringify({ rules: { "eslint/no-undef": "error" } }));
  const result = await run(bin("oxlint", "oxlint", process.cwd()), ["--config", config, "--no-ignore", "--format", "json", source], f.root);
  expect(result.status).toBe(1);
  expect(Buffer.byteLength(result.stdout)).toBeGreaterThan(3 * 1024 * 1024);
  const data = parseOutput(result, "Oxlint");
  expect(data.number_of_files).toBe(1);
  expect(data.diagnostics).toHaveLength(9000);
  expect(data.diagnostics.some(item => item.message.includes("missing8999"))).toBe(true);
  expect(readFileSync(source, "utf8")).toContain("missing8999");
  cleaned(f.root);
}, 30_000);

test("worker termination removes capture files and stops analyzer descendants", async () => {
  const f = fixture(`import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
spawn(process.execPath, ["--eval", "setTimeout(() => require('node:fs').writeFileSync('leaked', 'bad'), 700)"], { stdio: "inherit" });
writeFileSync("started", "yes");
setInterval(() => {}, 100);`);
  const worker = resolve(f.root, "worker.mjs");
  writeFileSync(worker, `import { run } from ${JSON.stringify(new URL("../src/blindfolded/analysis/runtime.mjs", import.meta.url).href)};
await run(${JSON.stringify(f.command)}, [], ${JSON.stringify(f.root)});`);
  const child = spawn(process.execPath, [worker], { cwd: f.root, stdio: "ignore" });
  const closed = new Promise(done => child.on("close", (code, signal) => done({ code, signal })));
  try {
    for (let attempt = 0; attempt < 100 && !existsSync(resolve(f.root, "started")); attempt++) await Bun.sleep(10);
    expect(existsSync(resolve(f.root, "started"))).toBe(true);
    child.kill("SIGTERM");
    const result = await closed;
    expect(result.code !== 0 || result.signal !== null).toBe(true);
    cleaned(f.root);
    await Bun.sleep(800);
    expect(existsSync(resolve(f.root, "leaked"))).toBe(false);
  } finally { child.kill("SIGKILL"); }
});

test("typed coverage rejects missing, duplicated, and contradictory assignment evidence", () => {
  const project = { root: "/project" };
  const group = { files: ["/project/index.ts"], path: "/temporary/review.json", base: "tsconfig.review.json" };
  const assigned = "Got tsconfig for file /project/index.ts: /project/tsconfig.json";
  const summary = "Done assigning files to programs. Total programs: 1. Unmatched files: 0";
  const program = "  Program /project/tsconfig.json: 1 files";
  const log = lines => lines.map(line => `2026/09/15 12:00:00.000000 ${line}`).join("\n");
  const valid = [];
  const coverage = typedCoverage(log([assigned, summary, program]), project, group, valid);
  expect(valid).toEqual([]);
  expect(coverage.selection).toBe("backend-discovery");
  expect(coverage.requestedConfiguration).toBe(group.path);
  for (const lines of [[], [summary, program], [assigned, assigned, summary, program],
    [assigned, summary, program.replace("1 files", "2 files")],
    [assigned, summary, program.replace("tsconfig.json", "wrong.json")],
    [assigned.replace("index.ts", "other.ts"), summary, program]]) {
    const gaps = [];
    typedCoverage(log(lines), project, group, gaps);
    expect(gaps.length).toBeGreaterThan(0);
  }
});
