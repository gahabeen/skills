import { afterEach, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { bunOnlyEnvironment } from "./runtime-environment.mjs";
import { provisionStorage, skillPermissions } from "./storage-fixture.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceSkill = join(root, "skills/510");
const temporary = [];
afterEach(() => { for (const directory of temporary.splice(0)) { skillPermissions(join(directory, "installed-skill"), true); rmSync(directory, { recursive: true, force: true }); } });

function fixture({ missingKnip = false, missingFallow = false, javascript = false, storage: choice } = {}) {
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
  const storage = provisionStorage(skill, consumer, { missingKnip, missingFallow, storage: choice });
  skillPermissions(skill, false);
  return { consumer, skill, extension, storage, env: bunOnlyEnvironment(directory) };
}

function run(f, ...args) {
  const result = spawnSync(process.execPath, [join(f.skill, "scripts/510.mjs"), "analyze", "--root", f.consumer, "--format", "json", ...args], { env: f.env, encoding: "utf8", timeout: 30_000, maxBuffer: 8 * 1024 * 1024 });
  expect(result.error).toBeUndefined();
  expect(result.stderr).toBe("");
  const report = JSON.parse(result.stdout);
  expect(result.status).toBe(report.success ? 0 : 1);
  expect(JSON.parse(readFileSync(join(f.storage.reports, "report.json"), "utf8"))).toEqual(report);
  expect(existsSync(join(f.skill, "runtime/toolchain/node_modules"))).toBe(false);
  return report;
}

test("one-run paths select a subdirectory without changing saved scope, storage, or ancestor settings", () => {
  const f = fixture({ storage: { mode: "custom", path: "analysis-state" } });
  mkdirSync(join(f.consumer, "src/selected"));
  mkdirSync(join(f.consumer, "src/selected-other"));
  writeFileSync(join(f.consumer, "src/selected/index.ts"), "export const answer = 42;\n");
  writeFileSync(join(f.consumer, "src/index.ts"), 'export { answer } from "./selected/index.js";\n');
  writeFileSync(join(f.consumer, "src/selected-other/broken.ts"), "export const broken: number = 'wrong';\n");
  writeFileSync(join(f.consumer, "src/selected-other/tsconfig.json"), "invalid JSON");
  writeFileSync(join(f.consumer, "src/selected-other/view.vue"), "<script>broken</script>");
  const preserved = [".fiveten/config.json", ".blindfolded.json", "tsconfig.json"].map((path) => [path, readFileSync(join(f.consumer, path), "utf8")]);
  const report = run(f, "--path", "./src/selected/");
  expect(report.files).toEqual(["src/selected/index.ts"]);
  expect(report.scope.paths).toEqual(["src/selected"]);
  expect(report.scope.pathSource).toBe("request");
  expect(report.success).toBe(true);
  expect(report.analyzers).toHaveLength(6);
  expect(report.analyzers.find((item) => item.tool === "typescript").configuration.map((item) => item.base)).toEqual(["tsconfig.json"]);
  for (const [path, content] of preserved) expect(readFileSync(join(f.consumer, path), "utf8")).toBe(content);
  expect(existsSync(join(f.consumer, "src/selected/.fiveten"))).toBe(false);
  const full = run(f);
  expect(full.files).toContain("src/selected-other/broken.ts");
  expect(full.success).toBe(false);
}, 30_000);

test("absolute and repeated paths retain selected findings and nested compiler coverage", () => {
  const f = fixture();
  mkdirSync(join(f.consumer, "extra"));
  writeFileSync(join(f.consumer, "extra/index.ts"), "export const wrong: number = 'wrong';\n");
  writeFileSync(join(f.consumer, "extra/tsconfig.json"), JSON.stringify({ extends: "../tsconfig.json", include: ["*.ts"] }));
  const report = run(f, "--path", join(f.consumer, "extra"), "--path", "src/index.ts", "--path", "extra/.");
  expect(report.scope.paths).toEqual(["extra", "src/index.ts"]);
  expect(report.files).toEqual(["extra/index.ts", "src/index.ts"]);
  expect(report.findings.some((item) => item.tool === "typescript" && item.file.endsWith("extra/index.ts") && item.rule === "TS2322")).toBe(true);
  expect(report.analyzers.find((item) => item.tool === "typescript").gaps).toEqual([]);
  expect(report.success).toBe(false);
}, 30_000);

test("the default review scope finds code outside saved analysis paths without rewriting them", () => {
  const f = fixture();
  mkdirSync(join(f.consumer, "src/selected"));
  writeFileSync(join(f.consumer, "src/selected/index.ts"), "export const answer = 42;\n");
  writeFileSync(join(f.consumer, "src/index.ts"), 'export { answer } from "./selected/index.js";\n');
  writeFileSync(join(f.consumer, "src/outside.ts"), "export const broken: number = 'wrong';\n");
  const path = join(f.consumer, ".blindfolded.json");
  const config = JSON.stringify({ paths: ["src/selected"] });
  writeFileSync(path, config);
  const configured = run(f);
  expect(configured.files).toEqual(["src/selected/index.ts"]);
  const review = spawnSync(process.execPath, [join(f.skill, "scripts/510.mjs"), "review"], {
    cwd: join(f.consumer, "src/selected"), env: f.env, encoding: "utf8", timeout: 20_000,
  });
  expect(review.status, review.stderr).toBe(0);
  const scope = JSON.parse(review.stdout.split("\n")[0].slice("Review scope: ".length));
  const report = run(f, ...scope.paths.flatMap((selected) => ["--path", selected]));
  expect(scope.root).toBe(report.root);
  expect(report.scope.paths).toEqual(["."]);
  expect(report.files).toContain("src/outside.ts");
  expect(report.findings.some((item) => item.tool === "typescript" && item.file.endsWith("src/outside.ts") && item.rule === "TS2322")).toBe(true);
  expect(report.success).toBe(false);
  expect(readFileSync(path, "utf8")).toBe(config);
  expect(existsSync(join(f.consumer, "executed"))).toBe(false);
}, 30_000);

test("a workspace subdirectory does not scan unrelated workspaces", () => {
  const f = fixture();
  const manifestPath = join(f.consumer, "package.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  manifest.workspaces = ["packages/*"];
  writeFileSync(manifestPath, JSON.stringify(manifest));
  for (const name of ["billing", "other"]) {
    const directory = join(f.consumer, "packages", name);
    mkdirSync(join(directory, "src"), { recursive: true });
    writeFileSync(join(directory, "package.json"), JSON.stringify({ name, private: true, type: "module", exports: "./src/index.ts" }));
    writeFileSync(join(directory, "tsconfig.json"), JSON.stringify({ extends: "../../tsconfig.json", include: ["src"] }));
    writeFileSync(join(directory, "src/index.ts"), "export const answer = 42;\n");
    writeFileSync(join(directory, "src/entry.ts"), 'export { answer } from "./index.js";\n');
  }
  const knipConfig = JSON.stringify({ workspaces: { "packages/*": { entry: ["src/entry.ts"] } } });
  writeFileSync(join(f.consumer, "knip.json"), knipConfig);
  writeFileSync(join(f.consumer, "packages/other/src/orphan.ts"), "export const unused = 1;\n");
  const report = run(f, "--path", "packages/billing");
  expect(report.files).toEqual(["packages/billing/src/entry.ts", "packages/billing/src/index.ts"]);
  expect(report.findings).toEqual([]);
  expect(report.gaps).toEqual([]);
  expect(report.success).toBe(true);
  const knip = report.analyzers.find((item) => item.tool === "knip");
  expect(knip.configuration.workspaces["packages/billing"].entry).toEqual(["src/entry.ts"]);
  expect(knip.scope.selectedWorkspaces).toEqual(["packages/billing"]);
  expect(knip.scope.includedWorkspaceDirs.some((path) => path.endsWith("packages/other"))).toBe(false);
  expect(readFileSync(join(f.consumer, "knip.json"), "utf8")).toBe(knipConfig);
}, 30_000);

test("missing, empty, and escaping scopes fail without falling back to the repository", () => {
  const f = fixture();
  symlinkSync(f.skill, join(f.consumer, "outside-link"), "dir");
  for (const path of ["missing", "", "../installed-skill", "outside-link"]) {
    const report = run(f, "--path", path);
    expect(report.success).toBe(false);
    expect(report.files).toEqual([]);
    expect(report.scope.paths).toEqual([path]);
    expect(report.gaps).toHaveLength(6);
    expect(report.analyzers.every((item) => item.status === "incomplete")).toBe(true);
  }
}, 30_000);

test("directory scopes treat route brackets as literal names", () => {
  const f = fixture();
  for (const name of ["[id]", "i"]) mkdirSync(join(f.consumer, "src", name));
  writeFileSync(join(f.consumer, "src/[id]/index.ts"), "export const answer = 42;\n");
  writeFileSync(join(f.consumer, "src/i/index.ts"), "export const wrong: number = 'wrong';\n");
  writeFileSync(join(f.consumer, "src/index.ts"), 'export { answer } from "./[id]/index.js";\n');
  const report = run(f, "--path", "src/[id]");
  expect(report.files).toEqual(["src/[id]/index.ts"]);
  expect(report.findings).toEqual([]);
  expect(report.gaps).toEqual([]);
  expect(report.success).toBe(true);
}, 30_000);

test("an isolated skill runs every analyzer, preserves build settings, and never starts application scripts", () => {
  const f = fixture();
  const path = join(f.consumer, "tsconfig.json");
  const original = readFileSync(path, "utf8");
  writeFileSync(join(f.consumer, "src/index.ts"), 'export const answer = 42;\n\nthrow new Error("application must not execute");\n');
  const report = run(f);
  expect(report.gaps).toEqual([]);
  expect(report.findings).toEqual([]);
  expect(report.success).toBe(true);
  expect(report.analyzers.map((item) => item.tool)).toEqual(["oxlint", "typescript", "knip", "dependency-cruiser", "sonarjs", "fallow"]);
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
  writeFileSync(join(f.consumer, ".fiveten/config.json"), JSON.stringify({ version: 1, storage: { mode: "project" }, analysis: { paths: ["src"], thresholds: { cognitive: 1 } } }));
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

test("boundary parsing and union narrowing work with all rules and the complete suite", () => {
  const f = fixture();
  writeFileSync(join(f.consumer, "src/index.ts"), `/** Decode an external label. */
export function parseLabel(value: unknown): string {
  if (typeof value !== "string") throw new TypeError("Expected label");

  return value;
}

/** Format either supported representation. */
export function display(value: string | number): string {
  return typeof value === "number" ? value.toFixed(2) : value;
}

/** Validate an untrusted label. */
export function isLabel(value: unknown): value is string {
  return typeof value === "string";
}
`);
  const valid = run(f);
  expect(valid.findings).toEqual([]);
  expect(valid.gaps).toEqual([]);
  expect(valid.success).toBe(true);
  writeFileSync(join(f.consumer, "src/index.ts"), `export function save(value: unknown): void { console.log(value); }

export function display(value: string): string { return typeof value === "string" ? value : ""; }
`);
  const invalid = run(f);
  expect(invalid.findings.some((item) => item.rule.includes("no-unknown-parameters"))).toBe(true);
  expect(invalid.findings.some((item) => item.rule.includes("no-runtime-typeof"))).toBe(true);
  expect(invalid.success).toBe(false);
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

function duplicateSources(f) {
  const content = Array.from({ length: 20 }, (_, index) => `export const value${index} = ${index};`).join("\n") + "\n";
  writeFileSync(join(f.consumer, "src/index.ts"), content);
  writeFileSync(join(f.consumer, "src/copy.test.ts"), content);
  writeFileSync(join(f.consumer, "src/empty.ts"), "// This file has no clone candidates.\n");
  writeFileSync(join(f.consumer, "src/types.d.ts"), "export declare const answer: number;\n");
  return content;
}

test("Fallow reports selected test-file clones despite ambient ignores and preserves locations", () => {
  const f = fixture();
  const original = duplicateSources(f);
  const config = JSON.stringify({ ignorePatterns: ["**/*"], duplicates: { minTokens: 99999 } });
  writeFileSync(join(f.consumer, ".fallowrc.json"), config);
  f.env.FALLOW_PRODUCTION = "true";
  f.env.FALLOW_CONFIG = join(f.consumer, ".fallowrc.json");
  const report = run(f);
  const result = report.analyzers.find((item) => item.tool === "fallow");
  expect(result.status).toBe("completed");
  expect(result.gaps).toEqual([]);
  expect(result.scope.discoveredFileCount).toBe(4);
  expect(result.scope.parsedFileCount).toBe(4);
  expect(result.scope.eligibleFileCount).toBe(2);
  expect(result.findings).toHaveLength(1);
  const clone = result.findings[0];
  expect(clone.classification).toBe("Review");
  expect(clone.relatedLocations.map((item) => item.file).sort()).toEqual([join(report.root, "src/copy.test.ts"), join(report.root, "src/index.ts")]);
  expect(clone.relatedLocations.every((item) => item.line === 1 && item.endLine === 20 && item.column === 1)).toBe(true);
  expect(clone.measurement.tokens).toBeGreaterThanOrEqual(50);
  expect(report.success).toBe(false);
  expect(readFileSync(join(f.consumer, "src/index.ts"), "utf8")).toBe(original);
  expect(readFileSync(join(f.consumer, ".fallowrc.json"), "utf8")).toBe(config);
  expect(existsSync(join(f.consumer, ".fallow"))).toBe(false);
}, 30_000);

test("Fallow compares only the requested source scope and honors recorded minimums", () => {
  const f = fixture();
  duplicateSources(f);
  const scoped = run(f, "--path", "src/index.ts");
  const selected = scoped.analyzers.find((item) => item.tool === "fallow");
  expect(selected.findings).toEqual([]);
  expect(selected.gaps).toEqual([]);
  expect(selected.scope.selectedFiles).toEqual(["src/index.ts"]);
  expect(selected.scope.comparison).toBe("selected-files-only");
  writeFileSync(join(f.consumer, ".blindfolded.json"), JSON.stringify({ paths: ["src"], thresholds: { duplicateTokens: 999, duplicateLines: 25 } }));
  const configured = run(f);
  const result = configured.analyzers.find((item) => item.tool === "fallow");
  expect(result.status).toBe("completed");
  expect(result.findings).toEqual([]);
  expect(configured.thresholds.duplicateTokens).toBe(999);
  expect(configured.thresholds.duplicateLines).toBe(25);
}, 30_000);

test("Fallow parser failures block completion and retain duplicate findings", () => {
  const f = fixture();
  duplicateSources(f);
  writeFileSync(join(f.consumer, "src/broken.ts"), "export function broken( { nope");
  const report = run(f);
  const result = report.analyzers.find((item) => item.tool === "fallow");
  expect(result.status).toBe("incomplete");
  expect(result.gaps.some((gap) => gap.includes("src/broken.ts") && gap.includes("source-parse-degraded"))).toBe(true);
  expect(result.findings).toHaveLength(1);
  expect(report.success).toBe(false);
}, 30_000);

test("missing Fallow fails the suite and retains the other analyzers' evidence", () => {
  const f = fixture({ missingFallow: true });
  writeFileSync(join(f.consumer, "src/index.ts"), "export function start() { Promise.resolve(42); }\n");
  const report = run(f);
  expect(report.analyzers.find((item) => item.tool === "fallow").status).toBe("incomplete");
  expect(report.gaps.some((gap) => gap.tool === "fallow")).toBe(true);
  expect(report.findings.some((item) => item.rule.includes("no-floating-promises"))).toBe(true);
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
