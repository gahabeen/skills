import { afterEach, test } from "bun:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { bunOnlyEnvironment } from "./runtime-environment.mjs";
import { provisionStorage, skillPermissions } from "./storage-fixture.mjs";
import { setTimeout as delay } from "node:timers/promises";
import { loadTool } from "../src/runtime/packages.mjs";
import { topics } from "../src/runtime/guides.mjs";

const [{ Client }, { StdioClientTransport }] = await Promise.all([
  loadTool("@modelcontextprotocol/sdk/client/index.js"), loadTool("@modelcontextprotocol/sdk/client/stdio.js"),
]);
const root = fileURLToPath(new URL("../", import.meta.url));
const temporary = [];
const clients = [];
afterEach(async () => {
  for (const client of clients.splice(0)) await client.close();
  for (const directory of temporary.splice(0)) { skillPermissions(resolve(directory, "installed skill"), true); rmSync(directory, { recursive: true, force: true }); }
});

async function fixture(marker = "answer", options = {}) {
  const directory = mkdtempSync(resolve(tmpdir(), "510-mcp-"));
  temporary.push(directory);
  const skill = resolve(directory, "installed skill");
  cpSync(resolve(root, "skills/510"), skill, { recursive: true, filter: (path) => !path.includes("/node_modules") && !path.includes("/.cache") });
  const project = resolve(directory, "project");
  mkdirSync(resolve(project, "src"), { recursive: true });
  writeFileSync(resolve(project, "package.json"), JSON.stringify({ name: "fixture", private: true, type: "module", exports: "./src/index.ts" }));
  writeFileSync(resolve(project, "tsconfig.json"), JSON.stringify({ compilerOptions: { strict: true, noEmit: true, module: "nodenext", target: "esnext" }, include: ["src"] }));
  writeFileSync(resolve(project, ".blindfolded.json"), JSON.stringify({ paths: ["src"] }));
  writeFileSync(resolve(project, "src/index.ts"), `export const ${marker} = 42;\n`);
  const storage = provisionStorage(skill, project, { storage: options.shared ? { mode: "custom", path: resolve(directory, "shared state") } : options.storage });
  skillPermissions(skill, false);
  const env = bunOnlyEnvironment(directory);
  const client = new Client({ name: "510-integration-test", version: "1.0.0" });
  const transport = new StdioClientTransport({ command: process.execPath, env,
    args: [resolve(skill, "scripts/510.mjs"), "serve", "--root", project], stderr: "pipe" });
  let stderr = "";
  transport.stderr?.on("data", (data) => { stderr += data; });
  clients.push(client);
  await client.connect(transport);
  async function call(name, args = {}) {
    const result = await client.callTool({ name, arguments: args });
    assert.equal(result.isError, undefined, JSON.stringify(result.content) + stderr);
    return result.structuredContent;
  }
  return { client, call, project, skill, env, storage, stderr: () => stderr };
}

test("installed MCP exposes tools, guides, healthy native search, and repository-scoped results", async () => {
  const f = await fixture();
  assert.deepEqual((await f.client.listTools()).tools.map((tool) => tool.name), ["doctor", "paths", "guide", "find_files", "search", "analyze", "analysis_result"]);
  assert.equal((await f.call("doctor")).ready, true);
  assert.match((await f.call("guide", { topic: "review" })).markdown, /Every\s+finding fails/);
  const resources = await f.client.listResources();
  const commit = await f.call("guide", { topic: "commit" });
  assert.equal(commit.topic, "commit");
  assert.equal(commit.markdown, readFileSync(resolve(root, "guides/commit.md"), "utf8"));
  const commitResource = await f.client.readResource({ uri: "five-ten://guides/commit" });
  assert.equal(commitResource.contents[0].text, commit.markdown);
  assert.deepEqual(resources.resources.map((resource) => resource.uri).sort(), topics.map((topic) => `five-ten://guides/${topic}`).sort());
  for (const topic of ["handoff", "grill", "grilling", "domain-modeling", "spec", "implement", "tdd", "debug", "review", "refactor", "codebase-design", "workflow-storage"]) {
    const uri = `five-ten://guides/${topic}`;
    assert(resources.resources.some((resource) => resource.uri === uri));
    const expected = readFileSync(resolve(root, "guides", `${topic}.md`), "utf8");
    assert.deepEqual(await f.call("guide", { topic }), { topic, markdown: expected });
    const resource = await f.client.readResource({ uri });
    assert.equal(resource.contents[0].text, expected);
  }
  const guide = await f.client.readResource({ uri: "five-ten://guides/refactor" });
  assert.match(guide.contents[0].text, /Preserve callback order/);
  const files = await f.call("find_files", { query: "index.ts" });
  assert.equal(files.items[0].relativePath, "src/index.ts");
  const hits = await f.call("search", { patterns: ["answer"], constraints: "*.ts" });
  assert.equal(hits.items[0].relativePath, "src/index.ts");
  assert.equal(hits.items[0].lineNumber, 1);
  assert.match(hits.items[0].lineContent, /answer/);
  const rejected = await f.client.callTool({ name: "analyze", arguments: { tools: ["oxlint"] } });
  assert.equal(rejected.isError, true);
}, 30_000);

test("MCP and CLI resolve the same workflow storage without creating artifact directories", async () => {
  const f = await fixture("answer", { shared: true });
  const paths = await f.call("paths");
  const cli = spawnSync(process.execPath, [resolve(f.skill, "scripts/510.mjs"), "paths", "--root", f.project], { env: f.env, encoding: "utf8" });
  assert.equal(cli.status, 0, cli.stderr);
  assert.deepEqual(paths, JSON.parse(cli.stdout));
  assert.equal(paths.specs, resolve(f.storage.projectData, "specs"));
  assert.equal(paths.debug, resolve(f.storage.projectData, "debug"));
  assert.equal(existsSync(paths.specs), false);
  assert.equal(existsSync(paths.debug), false);
  assert.equal((await f.client.listTools()).tools.find((tool) => tool.name === "paths").annotations.readOnlyHint, true);
});

async function completed(f, id) {
  for (let i = 0; i < 120; i++) {
    const result = await f.call("analysis_result", { id, limit: 1 });
    if (result.status !== "running") return result;
    await delay(100);
  }
  assert.fail("Analysis did not complete.");
}

test("MCP and CLI use the same complete suite and preserve source-only execution", async () => {
  const f = await fixture();
  writeFileSync(resolve(f.project, "src/index.ts"), 'export const answer = 42;\n\nthrow new Error("must never run");\n');
  const started = await f.call("analyze");
  assert.equal((await f.call("analyze")).id, started.id);
  const done = await completed(f, started.id);
  assert.equal(done.status, "completed");
  assert.equal(done.success, true);
  assert.equal(done.analyzers.length, 5);
  assert.equal(done.totalFindings, 0);
  assert.deepEqual(done.gaps, []);
  const report = JSON.parse(readFileSync(done.path, "utf8"));
  const cli = spawnSync(process.execPath, [resolve(f.skill, "scripts/510.mjs"), "analyze", "--root", f.project, "--format", "json"], { env: f.env, encoding: "utf8", timeout: 20_000 });
  assert.equal(cli.status, 0, cli.stderr);
  const other = JSON.parse(cli.stdout);
  assert.deepEqual(report.findings, other.findings);
  assert.deepEqual(report.gaps, other.gaps);
  assert.deepEqual(report.analyzers.map(({ tool, status }) => ({ tool, status })), other.analyzers.map(({ tool, status }) => ({ tool, status })));
}, 30_000);

test("MCP findings remain blocking across pages and unknown jobs fail explicitly", async () => {
  const f = await fixture();
  writeFileSync(resolve(f.project, "src/index.ts"), 'export function first() { void Promise.resolve(1); }\n\nexport function second() { void Promise.resolve(2); }\n');
  const { id } = await f.call("analyze");
  const first = await completed(f, id);
  assert.equal(first.success, false);
  assert.ok(first.totalFindings >= 2);
  assert.equal(first.findings.length, 1);
  assert.equal(first.nextOffset, 1);
  const second = await f.call("analysis_result", { id, offset: first.nextOffset, limit: 1 });
  assert.notDeepEqual(first.findings, second.findings);
  const unknown = await f.client.callTool({ name: "analysis_result", arguments: { id: "00000000-0000-4000-8000-000000000000" } });
  assert.equal(unknown.isError, true);
}, 30_000);

test("search isolates different server roots and handles OR patterns with pagination", async () => {
  const a = await fixture("firstProjectOnly", { shared: true });
  const b = await fixture("secondProjectOnly", { storage: a.storage.config.storage });
  assert.equal(a.storage.toolchain, b.storage.toolchain);
  assert.notEqual(a.storage.cache, b.storage.cache);
  assert.notEqual(a.storage.reports, b.storage.reports);
  const aPaths = await a.call("paths");
  const bPaths = await b.call("paths");
  assert.notEqual(aPaths.specs, bPaths.specs);
  assert.notEqual(aPaths.debug, bPaths.debug);
  writeFileSync(resolve(a.project, "src/second.ts"), "export const firstProjectOnlyAgain = 1;\n");
  const args = { patterns: ["firstProjectOnly", "missing"], constraints: "*.ts", limit: 1, context: 0 };
  const first = await a.call("search", args);
  assert.equal(first.items.length, 1);
  assert.ok(first.nextCursor);
  const second = await a.call("search", { ...args, cursor: first.nextCursor });
  assert.equal(second.items.length, 1);
  assert.notEqual(first.items[0].relativePath, second.items[0].relativePath);
  assert.equal((await b.call("search", { patterns: ["firstProjectOnly"] })).items.length, 0);
  assert.equal((await b.call("search", { patterns: ["secondProjectOnly"] })).items.length, 1);
}, 30_000);

test("closing a server cancels active analysis and saves an unsuccessful partial report", async () => {
  const f = await fixture();
  const { id } = await f.call("analyze");
  await f.client.close();
  const path = resolve(f.storage.reports, `runs/${id}.json`);
  for (let i = 0; i < 30 && !existsSync(path); i++) await delay(100);
  assert.ok(existsSync(path), f.stderr());
  const report = JSON.parse(readFileSync(path, "utf8"));
  assert.equal(report.success, false);
  assert.ok(report.gaps.some((gap) => gap.message.includes("cancelled")));
}, 15_000);
