import { afterEach, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { bunOnlyEnvironment } from "./runtime-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const temporary = [];
afterEach(() => {
  for (const path of temporary.splice(0)) rmSync(path, { recursive: true, force: true });
});

function fixture() {
  const directory = mkdtempSync(join(tmpdir(), "blindfolded-install-"));
  temporary.push(directory);
  const skill = join(directory, "installed-skill");
  cpSync(join(root, "skills/510"), skill, { recursive: true,
    filter: (path) => !path.includes("/node_modules") && !path.includes("/.run-") });
  const consumer = join(directory, "consumer");
  mkdirSync(consumer);
  return { env: bunOnlyEnvironment(directory), directory, skill, consumer, target: join(consumer, "tools/oxlint/blindfolded") };
}

function install(f, ...args) {
  return spawnSync(process.execPath, [join(f.skill, "scripts/510.mjs"), "install-rules", ...args], {
    cwd: f.consumer, env: f.env,
    encoding: "utf8",
  });
}

test("an isolated skill installs working generic rules with attribution", () => {
  const f = fixture();
  const result = install(f);
  expect(result.status, result.stderr).toBe(0);
  expect(existsSync(join(f.target, "effect"))).toBe(false);
  for (const path of ["LICENSE", "UPSTREAM.md", "vendor/eslint-stylistic/LICENSE", "vendor/eslint-stylistic/UPSTREAM.md"]) {
    expect(existsSync(join(f.target, path))).toBe(true);
  }
  // The consumer supplies Oxlint dependencies; no repository source is needed.
  symlinkSync(join(root, "node_modules"), join(f.consumer, "node_modules"), "dir");
  writeFileSync(join(f.consumer, ".oxlintrc.json"), JSON.stringify({
    jsPlugins: [
      { name: "blindfolded", specifier: "./tools/oxlint/blindfolded/index.ts" },
    ],
    rules: {
      "blindfolded/no-chained-type-assertions": "error",
    },
  }));
  writeFileSync(join(f.consumer, "invalid.ts"), 'const value = input as unknown as User;\n');
  writeFileSync(join(f.consumer, "valid.ts"), 'export const value = "ready";\n');
  function lint(file) {
    return spawnSync(process.execPath, [join(root, "node_modules/oxlint/bin/oxlint"), file], { cwd: f.consumer, env: f.env, encoding: "utf8" });
  }
  const invalid = lint("invalid.ts");
  expect(invalid.status, invalid.stderr).toBe(1);
  expect(invalid.stdout + invalid.stderr).toContain("no-chained-type-assertions");
  const valid = lint("valid.ts");
  expect(valid.status, valid.stderr).toBe(0);
});

test.each(["js", "ts"])("installed complexity preset reports the threshold boundary in %s", (extension) => {
  const f = fixture();
  expect(install(f).status).toBe(0);
  writeFileSync(join(f.consumer, ".oxlintrc.json"), JSON.stringify({
    extends: ["./tools/oxlint/blindfolded/review.config.json"],
  }));
  function branches(count) {
    return Array.from({ length: count }, (_, i) => `if (input === ${i}) return ${i};`).join("\n");
  }
  const accepted = join(f.consumer, `accepted.${extension}`);
  const flagged = join(f.consumer, `flagged.${extension}`);
  writeFileSync(accepted, `export function choose(input) {\n${branches(19)}\nreturn -1;\n}`);
  writeFileSync(flagged, `export function choose(input) {\n${branches(20)}\nreturn -1;\n}`);
  function lint(file, ...args) {
    const result = spawnSync(process.execPath, [join(root, "node_modules/oxlint/bin/oxlint"), "--format", "json", ...args, file], {
      cwd: f.consumer, env: f.env,
      encoding: "utf8",
    });
    expect(result.status, result.stderr).toBe(0);
    return JSON.parse(result.stdout).diagnostics;
  }
  expect(lint(accepted)).toEqual([]);
  for (const diagnostics of [lint(flagged), lint(flagged, "--config", join(root, ".oxlintrc.json"))]) {
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].code).toBe("eslint(complexity)");
    expect(diagnostics[0].severity).toBe("warning");
    expect(diagnostics[0].message).toContain("complexity of 21. Maximum allowed is 20.");
    expect(diagnostics[0].labels[0].span.line).toBe(1);
  }
  // The outer function must not absorb either nested function's branches.
  writeFileSync(accepted, `export function outer(input) {\nfunction first() {\n${branches(19)}\nreturn -1;\n}\nfunction second() {\n${branches(19)}\nreturn -1;\n}\nreturn [first, second];\n}`);
  expect(lint(accepted)).toEqual([]);
});

test("projects can override the complexity threshold and variant", () => {
  const f = fixture();
  expect(install(f).status).toBe(0);
  const file = join(f.consumer, "switch.ts");
  writeFileSync(file, "export function choose(input) { switch (input) { case 0: return 0; case 1: return 1; case 2: return 2; default: return -1; } }");
  function lint(variant) {
    writeFileSync(join(f.consumer, ".oxlintrc.json"), JSON.stringify({
      extends: ["./tools/oxlint/blindfolded/review.config.json"],
      rules: { "eslint/complexity": ["warn", { max: 2, variant }] },
    }));
    const result = spawnSync(process.execPath, [join(root, "node_modules/oxlint/bin/oxlint"), "--format", "json", file], {
      cwd: f.consumer, env: f.env,
      encoding: "utf8",
    });
    expect(result.status, result.stderr).toBe(0);
    return JSON.parse(result.stdout).diagnostics;
  }
  const classic = lint("classic");
  expect(classic).toHaveLength(1);
  expect(classic[0].message).toContain("complexity of 4. Maximum allowed is 2.");
  expect(lint("modified")).toEqual([]);
});

test("reinstallation preserves local edits and rejects a force override", () => {
  const f = fixture();
  expect(install(f).status).toBe(0);
  writeFileSync(join(f.target, "index.ts"), "// locally customized\n");
  const repeated = install(f);
  expect(repeated.status).toBe(1);
  expect(repeated.stderr).toContain("Refusing to overwrite");
  expect(install(f, "--force").status).toBe(1);
  expect(readFileSync(join(f.target, "index.ts"), "utf8")).toBe("// locally customized\n");
});

test("custom destinations support staging and paths containing spaces", () => {
  const f = fixture();
  const target = join(f.directory, "staged incoming");
  const result = install(f, target);
  expect(result.status, result.stderr).toBe(0);
  expect(existsSync(join(target, "index.ts"))).toBe(true);
  expect(existsSync(f.target)).toBe(false);
});
