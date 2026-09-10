import { afterEach, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { bunOnlyEnvironment } from "./runtime-environment.mjs";
import { provisionStorage, skillPermissions } from "./storage-fixture.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceSkill = join(root, "skills/510");
const temporary = [];
afterEach(() => { for (const directory of temporary.splice(0)) { skillPermissions(join(directory, "installed-skill"), true); rmSync(directory, { recursive: true, force: true }); } });

function fixture({ missingKnip = false, javascript = false, storage: choice } = {}) {
  const directory = mkdtempSync(join(tmpdir(), "blindfolded-analysis-"));
  temporary.push(directory);
  const consumer = join(directory, "consumer");
  const skill = join(directory, "installed-skill");
  cpSync(sourceSkill, skill, { recursive: true, filter: (path) => !path.includes("/node_modules") && !path.includes("/.run-") });
  mkdirSync(join(consumer, "src"), { recursive: true });
  const extension = javascript ? "js" : "ts";
  writeFileSync(join(consumer, "package.json"), JSON.stringify({ name: "consumer", private: true, type: "module", exports: `./src/index.${extension}`,
    scripts: { test: `${process.execPath} never-run.cjs`, build: `${process.execPath} never-run.cjs` } }));
  writeFileSync(join(consumer, "never-run.cjs"), "require('node:fs').writeFileSync('executed', 'bad');");
  writeFileSync(join(consumer, ".blindfolded.json"), JSON.stringify({ paths: ["src"] }));
  if (!javascript) writeFileSync(join(consumer, "tsconfig.json"), JSON.stringify({ compilerOptions: { target: "esnext", module: "nodenext", strict: true, noEmit: true }, include: ["src/**/*"] }));
  writeFileSync(join(consumer, `src/index.${extension}`), "export const answer = 42;\n");
  const storage = provisionStorage(skill, consumer, { missingKnip, storage: choice });
  skillPermissions(skill, false);
  return { consumer, skill, extension, storage, env: bunOnlyEnvironment(directory) };
}

function run(f) {
  const result = spawnSync(process.execPath, [join(f.skill, "scripts/510.mjs"), "analyze", "--root", f.consumer, "--format", "json"], { env: f.env, encoding: "utf8", timeout: 30_000, maxBuffer: 8 * 1024 * 1024 });
  expect(result.error).toBeUndefined();
  expect(result.stderr).toBe("");
  const report = JSON.parse(result.stdout);
  expect(result.status).toBe(report.success ? 0 : 1);
  expect(JSON.parse(readFileSync(join(f.storage.reports, "report.json"), "utf8"))).toEqual(report);
  expect(existsSync(join(f.skill, "runtime/toolchain/node_modules"))).toBe(false);
  return report;
}

test("an isolated skill runs every analyzer, preserves build settings, and never starts application scripts", () => {
  const f = fixture();
  const path = join(f.consumer, "tsconfig.json");
  const original = readFileSync(path, "utf8");
  writeFileSync(join(f.consumer, "src/index.ts"), 'export const answer = 42;\n\nthrow new Error("application must not execute");\n');
  const report = run(f);
  expect(report.gaps).toEqual([]);
  expect(report.findings).toEqual([]);
  expect(report.success).toBe(true);
  expect(report.analyzers.map((item) => item.tool)).toEqual(["oxlint", "typescript", "knip", "dependency-cruiser", "sonarjs"]);
  expect(readFileSync(path, "utf8")).toBe(original);
  const profile = report.analyzers.find((item) => item.tool === "typescript").configuration[0].compilerOptions;
  expect(profile.strictNullChecks).toBe(true);
  expect(profile.noImplicitAny).toBe(true);
  expect(existsSync(join(f.consumer, "executed"))).toBe(false);
}, 30_000);

test("strict compiler profiles override loose flags while unavailable typed rules fail explicitly", () => {
  const f = fixture();
  const path = join(f.consumer, "tsconfig.json");
  const config = JSON.parse(readFileSync(path, "utf8"));
  config.compilerOptions.strictNullChecks = false;
  config.compilerOptions.noImplicitAny = false;
  writeFileSync(path, JSON.stringify(config));
  const original = readFileSync(path, "utf8");
  const report = run(f);
  const compiler = report.analyzers.find((item) => item.tool === "typescript");
  expect(compiler.status).toBe("completed");
  expect(compiler.configuration[0].compilerOptions.strictNullChecks).toBe(true);
  expect(compiler.configuration[0].compilerOptions.noImplicitAny).toBe(true);
  expect(report.gaps.some((gap) => gap.tool === "oxlint" && gap.message.includes("strictNullChecks"))).toBe(true);
  expect(readFileSync(path, "utf8")).toBe(original);
  expect(report.success).toBe(false);
}, 30_000);

test("typed checks find floating and misused promises, missed union cases, and stricter indexed/optional contracts", () => {
  const f = fixture();
  writeFileSync(join(f.consumer, "src/index.ts"), `export function start() { void Promise.resolve(42); }

export function schedule() { const callback: () => void = async () => {}; callback(); }

export function describe(value: 'a' | 'b') { switch (value) { case 'a': return 1; } }

export function lookup(values: number[]): number { return values[0]; }

export const options: { value?: number } = { value: undefined };
`);
  const report = run(f);
  const rules = report.findings.map((item) => item.rule).join("\n");
  expect(rules).toContain("no-floating-promises");
  expect(rules).toContain("no-misused-promises");
  expect(rules).toContain("switch-exhaustiveness-check");
  expect(rules).toContain("TS2322");
  expect(rules).toContain("TS2375");
  expect(report.success).toBe(false);
  expect(report.analyzers.find((item) => item.tool === "typescript").configuration[0].compilerOptions.noUncheckedIndexedAccess).toBe(true);
}, 30_000);

test("a Review finding alone fails the full analysis", () => {
  const f = fixture();
  writeFileSync(join(f.consumer, ".510/config.json"), JSON.stringify({ version: 1, storage: { mode: "project" }, analysis: { paths: ["src"], thresholds: { cognitive: 1 } } }));
  writeFileSync(join(f.consumer, "src/index.ts"), `export function score(value: number) {
  if (value > 0) {
    if (value > 1) {
      return 2;
    }
  }

  return 0;
}
`);
  const report = run(f);
  expect(report.gaps).toEqual([]);
  expect(report.findings).toHaveLength(1);
  expect(report.findings[0].classification).toBe("Review");
  expect(report.findings[0].rule).toBe("sonarjs/cognitive-complexity");
  expect(report.findings[0].measurement).toEqual({ value: 3, limit: 1 });
  expect(report.success).toBe(false);
}, 30_000);

test("handled promises, exhaustive switches, and accurate indexed/optional types pass", () => {
  const f = fixture();
  writeFileSync(join(f.consumer, "src/index.ts"), `export async function start() { await Promise.resolve(42); }

export function schedule(callback: () => Promise<void>) { return callback(); }

export function describe(value: 'a' | 'b') { switch (value) { case 'a': return 1; case 'b': return 2; } }

export function lookup(values: number[]): number | undefined { return values[0]; }

export const options = {} satisfies { value?: number };
`);
  const report = run(f);
  expect(report.gaps).toEqual([]);
  expect(report.findings).toEqual([]);
  expect(report.success).toBe(true);
}, 30_000);

test("cyclomatic complexity and nesting are measured and blocking", () => {
  const f = fixture();
  writeFileSync(join(f.consumer, ".blindfolded.json"), JSON.stringify({ paths: ["src"], thresholds: { cyclomatic: 2, nesting: 1, cognitive: 99 } }));
  writeFileSync(join(f.consumer, "src/index.ts"), `export function score(value: number) {
  if (value > 0) {
    if (value > 1) {
      return 2;
    }
  }

  return 0;
}
`);
  const report = run(f);
  const rules = report.findings.map((item) => item.rule);
  expect(rules).toContain("eslint(complexity)");
  expect(rules).toContain("eslint(max-depth)");
  expect(report.findings.every((item) => item.classification === "Review")).toBe(true);
  expect(report.success).toBe(false);
}, 30_000);

test("unused files and import cycles appear together", () => {
  const f = fixture();
  writeFileSync(join(f.consumer, "src/index.ts"), 'import { alternate } from "./other.js";\n\nexport function start(): number { return alternate(); }\n');
  writeFileSync(join(f.consumer, "src/other.ts"), 'import { start } from "./index.js";\n\nexport function alternate(): number { return start(); }\n');
  writeFileSync(join(f.consumer, "src/orphan.ts"), "export const unused = 1;\n");
  const report = run(f);
  expect(report.findings.some((item) => item.tool === "knip" && item.rule === "files")).toBe(true);
  expect(report.findings.some((item) => item.rule === "blindfolded/no-cycles")).toBe(true);
}, 30_000);

test("declared architecture boundaries are enforced", () => {
  const f = fixture();
  writeFileSync(join(f.consumer, "src/index.ts"), 'import { data } from "./storage.js";\n\nexport const value = data;\n');
  writeFileSync(join(f.consumer, "src/storage.ts"), "export const data = 1;\n");
  writeFileSync(join(f.consumer, ".dependency-cruiser.json"), JSON.stringify({ forbidden: [{ name: "no-direct-storage", severity: "warn", from: { path: "src/index" }, to: { path: "src/storage" } }] }));
  const report = run(f);
  expect(report.findings.some((item) => item.rule === "no-direct-storage" && item.classification === "Enforce")).toBe(true);
}, 30_000);

test("package subpath exports resolve through the dependency graph", () => {
  const f = fixture();
  const dependency = join(f.consumer, "node_modules/example");
  mkdirSync(dependency, { recursive: true });
  writeFileSync(join(dependency, "package.json"), JSON.stringify({ name: "example", version: "1.0.0", type: "module", exports: { "./value": { types: "./value.d.ts", default: "./value.js" } } }));
  writeFileSync(join(dependency, "value.js"), "export const value = 1;\n");
  writeFileSync(join(dependency, "value.d.ts"), "export declare const value: number;\n");
  const path = join(f.consumer, "package.json");
  const metadata = JSON.parse(readFileSync(path, "utf8"));
  metadata.dependencies = { example: "1.0.0" };
  writeFileSync(path, JSON.stringify(metadata));
  writeFileSync(join(f.consumer, "src/index.ts"), 'import { value } from "example/value";\n\nexport const answer = value;\n');
  const report = run(f);
  expect(report.gaps).toEqual([]);
  expect(report.success).toBe(true);
}, 30_000);

test("an unresolved dependency remains a finding and a coverage gap", () => {
  const f = fixture();
  writeFileSync(join(f.consumer, "src/index.ts"), 'export { missing } from "./missing.js";\n');
  const report = run(f);
  expect(report.findings.some((item) => item.rule === "blindfolded/no-unresolved")).toBe(true);
  expect(report.gaps.some((gap) => gap.tool === "dependency-cruiser")).toBe(true);
  expect(report.success).toBe(false);
}, 30_000);

test("a missing analyzer fails while keeping other analyzers' findings", () => {
  const f = fixture({ missingKnip: true });
  writeFileSync(join(f.consumer, "src/index.ts"), "export function start() { Promise.resolve(42); }\n");
  const report = run(f);
  expect(report.analyzers.find((item) => item.tool === "knip").status).toBe("incomplete");
  expect(report.gaps.some((gap) => gap.tool === "knip")).toBe(true);
  expect(report.findings.some((item) => item.rule.includes("no-floating-promises"))).toBe(true);
  expect(report.analyzers.find((item) => item.tool === "sonarjs").status).toBe("completed");
  expect(report.success).toBe(false);
}, 30_000);

test("files outside TypeScript project coverage cannot produce a clean result", () => {
  const f = fixture();
  writeFileSync(join(f.consumer, "tsconfig.json"), JSON.stringify({ compilerOptions: { noEmit: true }, files: ["src/index.ts"] }));
  writeFileSync(join(f.consumer, "src/missed.ts"), "export const missed = 1;\n");
  const report = run(f);
  expect(report.gaps.some((gap) => gap.message.includes("No analysis project covers") && gap.message.includes("missed.ts"))).toBe(true);
  expect(report.success).toBe(false);
}, 30_000);

test("JavaScript without a tsconfig receives default typed promise analysis", () => {
  const f = fixture({ javascript: true });
  writeFileSync(join(f.consumer, "src/index.js"), "export function start() { Promise.resolve(42); }\n");
  const report = run(f);
  expect(report.findings.some((item) => item.rule.includes("no-floating-promises"))).toBe(true);
}, 30_000);

test("the typed backend must account for files selected through secondary configs", () => {
  const f = fixture();
  writeFileSync(join(f.consumer, "tsconfig.json"), JSON.stringify({ compilerOptions: { target: "esnext", module: "nodenext", strict: true }, files: ["src/index.ts"] }));
  writeFileSync(join(f.consumer, "tsconfig.other.json"), JSON.stringify({ extends: "./tsconfig.json", files: ["src/other.ts"] }));
  writeFileSync(join(f.consumer, "src/other.ts"), "export function detached() { Promise.resolve(42); }\n");
  const report = run(f);
  const checked = report.findings.some((item) => item.tool === "oxlint" && item.file.endsWith("other.ts") && item.rule.includes("no-floating-promises"));
  const unavailable = report.gaps.some((gap) => gap.tool === "oxlint" && gap.message.includes("could not assign"));
  expect(checked || unavailable).toBe(true);
  expect(report.analyzers.find((item) => item.tool === "typescript").gaps).toEqual([]);
}, 30_000);

test("tooling configurations may execute, and broken configurations retain other results", () => {
  const f = fixture();
  const config = join(f.consumer, "knip.config.js");
  writeFileSync(config, `import { writeFileSync } from 'node:fs';\nwriteFileSync(new URL('./config-evaluated', import.meta.url), 'yes');\nexport default {};\n`);
  expect(run(f).success).toBe(true);
  expect(existsSync(join(f.consumer, "config-evaluated"))).toBe(true);
  writeFileSync(config, "throw new Error('broken tooling configuration');\nexport default {};\n");
  const report = run(f);
  expect(report.gaps.some((gap) => gap.tool === "knip" && gap.message.includes("broken tooling configuration"))).toBe(true);
  expect(report.analyzers.find((item) => item.tool === "typescript").status).toBe("completed");
}, 30_000);

test("unsupported embedded source and analyzer opt-out options fail explicitly", () => {
  const f = fixture();
  writeFileSync(join(f.consumer, "src/view.vue"), "<script setup>const label = 'hello';</script>");
  const report = run(f);
  expect(report.gaps.some((gap) => gap.tool === "source-coverage" && gap.message.includes("view.vue"))).toBe(true);
  writeFileSync(join(f.consumer, ".blindfolded.json"), JSON.stringify({ paths: ["src"], tools: ["oxlint"] }));
  const invalid = run(f);
  expect(invalid.success).toBe(false);
  expect(invalid.gaps[0].message).toContain("Analyzers cannot be disabled");
}, 30_000);

test("custom storage under the project is excluded from source and compiler discovery", () => {
  const f = fixture({ storage: { mode: "custom", path: "analysis-state" } });
  mkdirSync(f.storage.cache, { recursive: true });
  writeFileSync(join(f.storage.cache, "invalid.ts"), "this is generated data, not source;");
  writeFileSync(join(f.storage.cache, "tsconfig.json"), "invalid JSON");
  rmSync(join(f.consumer, "never-run.cjs"));
  const metadata = JSON.parse(readFileSync(join(f.consumer, "package.json"), "utf8"));
  delete metadata.scripts;
  writeFileSync(join(f.consumer, "package.json"), JSON.stringify(metadata));
  writeFileSync(join(f.consumer, ".blindfolded.json"), JSON.stringify({ paths: ["."] }));
  const report = run(f);
  expect(report.files).toEqual(["src/index.ts"]);
  expect(report.gaps).toEqual([]);
  expect(report.findings).toEqual([]);
  expect(report.success).toBe(true);
}, 30_000);
