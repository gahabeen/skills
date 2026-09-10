import { afterEach, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { bunOnlyEnvironment } from "./runtime-environment.mjs";
import { provisionStorage, skillPermissions } from "./storage-fixture.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const temporary = [];
afterEach(() => { for (const path of temporary.splice(0)) { skillPermissions(resolve(path, "skill with spaces"), true); rmSync(path, { recursive: true, force: true }); } });

function installed({ dependencies = true } = {}) {
  const directory = realpathSync(mkdtempSync(resolve(tmpdir(), "510-runtime-")));
  temporary.push(directory);
  const skill = resolve(directory, "skill with spaces");
  cpSync(resolve(root, "skills/510"), skill, { recursive: true, filter: (path) => !path.includes("/node_modules") && !path.includes("/.cache") });
  if (dependencies) provisionStorage(skill, directory);
  skillPermissions(skill, false);
  return { skill, directory, env: bunOnlyEnvironment(directory) };
}

function run({ skill, env, directory }, ...args) {
  return spawnSync(process.execPath, [resolve(skill, "scripts/510.mjs"), ...args], { env, cwd: directory, encoding: "utf8", timeout: 20_000 });
}

test("isolated doctor verifies locked dependencies and native FFF loading", () => {
  const f = installed();
  const result = run(f, "doctor");
  expect(result.status, result.stderr).toBe(0);
  const status = JSON.parse(result.stdout);
  expect(status.ready).toBe(true);
  expect(status.runtimes).toEqual([{ name: "bun", expected: "1.4.2", installed: process.versions.bun, executable: process.execPath, ready: true }]);
  expect(status.search.nativeVersion).toBe("0.10.6");
  expect(status.packages.every((item) => item.ready)).toBe(true);
});

test("doctor retains diagnostics when dependencies are missing", () => {
  const f = installed({ dependencies: false });
  const result = run(f, "doctor");
  expect(result.status).toBe(1);
  const status = JSON.parse(result.stdout);
  expect(status.ready).toBe(false);
  expect(status.packages.every((item) => !item.ready)).toBe(true);
  expect(status.search.ready).toBe(false);
  expect(status.search.error).toContain("installed missing");
  expect(run(f, "serve", "--root", f.directory).stderr).toContain("installed missing");
});

test("connection configuration uses the installed entrypoint and absolute paths", () => {
  const f = installed({ dependencies: false });
  const { skill, directory, env } = f;
  const project = resolve(directory, "project with spaces");
  mkdirSync(project);
  const result = run(f, "mcp-config", "--root", project);
  expect(result.status, result.stderr).toBe(0);
  const { command, args } = JSON.parse(result.stdout).mcpServers["510"];
  expect(isAbsolute(command)).toBe(true);
  expect(command).toBe(process.execPath);
  expect(args).toEqual(["--no-install", resolve(skill, "runtime/src/cli/main.mjs"), "serve", "--root", project]);
  const probe = spawnSync(command, [...args.slice(0, 2), "guide", "refactor"], { env, encoding: "utf8" });
  expect(probe.status, probe.stderr).toBe(0);
  expect(probe.stdout).toContain("Preserve callback order");
  expect(run(f, "serve").status).toBe(1);
  expect(run(f, "guide", "../../package").status).toBe(1);
});

test("conversation workflows and their supporting guides work in an isolated read-only skill without init", () => {
  const f = installed({ dependencies: false });
  const instructions = "# Existing project rules\n\nPreserve this file.\n";
  writeFileSync(resolve(f.directory, "AGENTS.md"), instructions);
  for (const topic of ["dox", "handoff", "grill", "grilling", "domain-modeling", "spec", "implement", "tdd", "debug", "review", "refactor", "codebase-design", "workflow-storage"]) {
    const expected = readFileSync(resolve(root, "guides", `${topic}.md`), "utf8");
    const guide = run(f, "guide", topic);
    expect(guide.status, guide.stderr).toBe(0);
    expect(guide.stdout).toBe(`${expected}\n`);
    if (["handoff", "grill", "spec", "implement", "debug", "review", "refactor"].includes(topic)) {
      const alias = run(f, topic);
      expect(alias.status, alias.stderr).toBe(0);
      expect(alias.stdout).toBe(guide.stdout);
      expect(run(f, topic, "unexpected-argument").status).toBe(1);
    }
  }
  for (const upstream of ["agent0ai-dox", "mattpocock-skills"]) {
    const license = `guides/upstream/${upstream}/LICENSE`;
    expect(readFileSync(resolve(f.skill, "runtime", license), "utf8")).toBe(readFileSync(resolve(root, license), "utf8"));
  }
  expect(readFileSync(resolve(f.directory, "AGENTS.md"), "utf8")).toBe(instructions);
  expect(existsSync(resolve(f.directory, ".510"))).toBe(false);
});

test("installed commit guidance works without dependencies or project init", () => {
  const f = installed({ dependencies: false });
  const result = run(f, "commit");
  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toBe(readFileSync(resolve(root, "guides/commit.md"), "utf8") + "\n");
  const guide = run(f, "guide", "commit");
  expect(guide.status, guide.stderr).toBe(0);
  expect(guide.stdout).toBe(result.stdout);
  expect(run(f, "commit", "--all").status).toBe(1);
  expect(existsSync(resolve(f.directory, ".510"))).toBe(false);
});

test("installed PR guidance carries an optional base without Git, dependencies, or init", () => {
  const f = installed({ dependencies: false });
  const expected = readFileSync(resolve(root, "guides/pr.md"), "utf8") + "\n";
  for (const args of [["pr"], ["guide", "pr"]]) {
    const result = run(f, ...args);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toBe(expected);
  }
  for (const base of ["main", "feature/stack-parent"]) {
    const result = run(f, "pr", "--base", base);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toBe(`PR request: ${JSON.stringify({ base })}\n\n${expected}`);
  }
  for (const args of [["--base"], ["--base", ""], ["--base", "   "], ["--unknown"], ["main"]]) {
    expect(run(f, "pr", ...args).status).toBe(1);
  }
  expect(existsSync(resolve(f.directory, ".510"))).toBe(false);
  expect(existsSync(resolve(f.directory, ".git"))).toBe(false);
});

test("review accepts repository-relative and absolute source paths without initialization", () => {
  const f = installed({ dependencies: false });
  mkdirSync(resolve(f.directory, ".git"));
  const selected = resolve(f.directory, "src/selected module");
  mkdirSync(selected, { recursive: true });
  writeFileSync(resolve(selected, "index.ts"), "export const answer = 42;\n");
  for (const path of ["src/selected module", selected]) {
    const result = run(f, "review", path, "--root", f.directory);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout.split("\n")[0]).toBe(`Review scope: ${JSON.stringify({ root: f.directory, paths: ["src/selected module"] })}`);
    expect(result.stdout).toContain(readFileSync(resolve(root, "guides/review.md"), "utf8"));
  }
  expect(run({ ...f, directory: selected }, "review", "src/selected module").status).toBe(0);
  expect(run(f, "review", "missing").status).toBe(1);
  expect(existsSync(resolve(f.directory, ".510"))).toBe(false);
});

test("workflow paths resolve without init and reuse custom or shared storage from nested directories", () => {
  const f = installed({ dependencies: false });
  mkdirSync(resolve(f.directory, ".git"));
  const nested = resolve(f.directory, "src/nested");
  mkdirSync(nested, { recursive: true });
  const initial = run({ ...f, directory: nested }, "paths");
  expect(initial.status, initial.stderr).toBe(0);
  const defaults = JSON.parse(initial.stdout);
  expect(defaults.root).toBe(f.directory);
  expect(defaults.specs).toBe(resolve(f.directory, ".510/specs"));
  expect(defaults.debug).toBe(resolve(f.directory, ".510/debug"));
  expect(existsSync(resolve(f.directory, ".510"))).toBe(false);
  mkdirSync(resolve(f.directory, ".510"));
  const path = resolve(f.directory, ".510/config.json");
  for (const storage of [{ mode: "custom", path: "local state" }, { mode: "shared" }]) {
    const config = JSON.stringify({ version: 1, storage });
    writeFileSync(path, config);
    const result = run({ ...f, directory: nested }, "paths");
    expect(result.status, result.stderr).toBe(0);
    const paths = JSON.parse(result.stdout);
    expect(paths.storage).toEqual(storage);
    expect(paths.base).toBe(storage.mode === "shared" ? resolve(homedir(), ".510") : resolve(f.directory, "local state"));
    expect(paths.projectData).toMatch(/\/projects\/[a-f0-9]{24}$/);
    expect(paths.specs).toBe(resolve(paths.projectData, "specs"));
    expect(paths.debug).toBe(resolve(paths.projectData, "debug"));
    expect(existsSync(paths.projectData)).toBe(false);
    expect(readFileSync(path, "utf8")).toBe(config);
    expect(existsSync(resolve(nested, ".510"))).toBe(false);
  }
  writeFileSync(path, JSON.stringify({ version: 1, storage: { mode: "invalid" } }));
  expect(run(f, "paths").status).toBe(1);
  expect(existsSync(defaults.specs)).toBe(false);
});

test("workflow paths reject destinations escaping project storage or entering the installed skill", () => {
  const f = installed({ dependencies: false });
  const storage = resolve(f.directory, ".510");
  mkdirSync(storage);
  const outside = resolve(f.directory, "outside");
  mkdirSync(outside);
  for (const name of ["specs", "debug"]) {
    const path = resolve(storage, name);
    symlinkSync(outside, path, "dir");
    const escaped = run(f, "paths");
    expect(escaped.status).toBe(1);
    expect(escaped.stderr).toContain("leaves the configured project storage");
    rmSync(path);
    symlinkSync(f.skill, path, "dir");
    const installed = run(f, "paths");
    expect(installed.status).toBe(1);
    expect(installed.stderr).toContain("never writes inside the installed skill");
    rmSync(path);
  }
});

test("init keeps the frozen toolchain and consuming project intact on repeat runs", () => {
  const f = installed({ dependencies: false });
  const { skill, directory, env } = f;
  const manifest = resolve(directory, "package.json");
  writeFileSync(manifest, '{"name":"untouched","private":true}\n');
  const instructions = "# Existing project rules\n\nPreserve this file.\n";
  writeFileSync(resolve(directory, "AGENTS.md"), instructions);
  const lock = resolve(skill, "runtime/toolchain/bun.lock");
  const before = readFileSync(lock, "utf8");
  for (let i = 0; i < 2; i++) {
    const result = spawnSync(process.execPath, [resolve(skill, "scripts/510.mjs"), "init"], { env, cwd: directory, encoding: "utf8", timeout: 20_000 });
    expect(result.status, result.stderr + result.stdout).toBe(0);
    const status = JSON.parse(result.stdout);
    expect(status.installed).toBe(i === 0);
    expect(status.storage.base).toBe(resolve(directory, ".510"));
    expect(status.connection.status).toBe("not-verified");
    expect(status.documentation).toEqual({ status: "agent-action-required", guide: {
      topic: "dox", markdown: readFileSync(resolve(root, "guides/dox.md"), "utf8"),
    } });
    expect(JSON.parse(readFileSync(status.connection.path, "utf8"))).toEqual(status.connection.configuration);
  }
  expect(existsSync(resolve(skill, "runtime/toolchain/node_modules"))).toBe(false);
  expect(readFileSync(resolve(directory, ".510/.gitignore"), "utf8")).toContain("/reports/");
  expect(readFileSync(resolve(directory, ".510/.gitignore"), "utf8")).toContain("/debug/");
  expect(readFileSync(resolve(directory, ".510/.gitignore"), "utf8")).not.toContain("/specs/");
  expect(readFileSync(lock, "utf8")).toBe(before);
  expect(readFileSync(manifest, "utf8")).toBe('{"name":"untouched","private":true}\n');
  expect(readFileSync(resolve(directory, "AGENTS.md"), "utf8")).toBe(instructions);
}, 45_000);

test("custom storage is reused from nested directories and preserves project choices", () => {
  const f = installed({ dependencies: false });
  mkdirSync(resolve(f.directory, ".git"));
  const nested = resolve(f.directory, "src/nested");
  mkdirSync(nested, { recursive: true });
  const configured = run({ ...f, directory: nested }, "init", "--storage", "local state");
  expect(configured.status, configured.stderr).toBe(0);
  const first = JSON.parse(configured.stdout);
  expect(first.storage.root).toBe(f.directory);
  expect(first.storage.base).toBe(resolve(f.directory, "local state"));
  const config = JSON.parse(readFileSync(first.storage.configPath, "utf8"));
  config.analysis = { paths: ["src"], thresholds: { cognitive: 9 } };
  writeFileSync(first.storage.configPath, JSON.stringify(config));
  writeFileSync(resolve(f.directory, ".510/.gitignore"), "# custom ignore\n/notes/\n");
  const repeated = run({ ...f, directory: nested }, "init");
  expect(repeated.status, repeated.stderr).toBe(0);
  const second = JSON.parse(repeated.stdout);
  expect(second.installed).toBe(false);
  expect(second.storage.toolchain).toBe(first.storage.toolchain);
  expect(second.storage.config).toEqual(config);
  expect(readFileSync(resolve(f.directory, ".510/.gitignore"), "utf8")).toContain("# custom ignore\n/notes/\n");
  const status = run({ ...f, directory: nested }, "doctor");
  expect(status.status, status.stderr).toBe(0);
  expect(JSON.parse(status.stdout).storage.base).toBe(first.storage.base);
  expect(existsSync(resolve(nested, ".510"))).toBe(false);
}, 45_000);

test("two projects share a toolchain while keeping reports and caches separate", () => {
  const f = installed({ dependencies: false });
  const shared = resolve(f.directory, ".510");
  const projects = [f.directory, resolve(f.directory, "second")];
  const statuses = projects.map((project) => {
    mkdirSync(project, { recursive: true });
    const result = run(f, "init", "--root", project, "--storage", shared);
    expect(result.status, result.stderr).toBe(0);
    return JSON.parse(result.stdout);
  });
  expect(statuses[0].installed).toBe(true);
  expect(statuses[1].installed).toBe(false);
  expect(statuses[0].storage.toolchain).toBe(statuses[1].storage.toolchain);
  expect(statuses[0].storage.cache).not.toBe(statuses[1].storage.cache);
  expect(statuses[0].storage.reports).not.toBe(statuses[1].storage.reports);
  expect(readFileSync(resolve(shared, ".gitignore"), "utf8")).toContain("/projects/");
}, 45_000);

test("an updated toolchain gets a new location and retains existing reports and settings", () => {
  const f = installed({ dependencies: false });
  const first = run(f, "init");
  expect(first.status, first.stderr).toBe(0);
  const before = JSON.parse(first.stdout);
  mkdirSync(before.storage.reports);
  writeFileSync(resolve(before.storage.reports, "saved.json"), "{}\n");
  skillPermissions(f.skill, true);
  const manifest = resolve(f.skill, "runtime/toolchain/package.json");
  const metadata = JSON.parse(readFileSync(manifest, "utf8"));
  metadata.description = "A new toolchain snapshot";
  writeFileSync(manifest, JSON.stringify(metadata, null, 2));
  skillPermissions(f.skill, false);
  const updated = run(f, "init");
  expect(updated.status, updated.stderr).toBe(0);
  const after = JSON.parse(updated.stdout);
  expect(after.storage.toolchain).not.toBe(before.storage.toolchain);
  expect(existsSync(before.storage.toolchain)).toBe(true);
  expect(after.storage.config).toEqual(before.storage.config);
  expect(readFileSync(resolve(after.storage.reports, "saved.json"), "utf8")).toBe("{}\n");
}, 45_000);

test("storage and explicit output cannot write through a symlink into the skill", () => {
  const f = installed({ dependencies: false });
  const alias = resolve(f.directory, "skill alias");
  symlinkSync(f.skill, alias, "dir");
  const init = run(f, "init", "--storage", resolve(alias, "state"));
  expect(init.status).toBe(1);
  expect(init.stderr).toContain("never writes inside the installed skill");
  expect(existsSync(resolve(f.directory, ".510"))).toBe(false);
  const analysis = run(f, "analyze", "--output", resolve(alias, "report.json"));
  expect(analysis.status).toBe(1);
  expect(analysis.stderr).toContain("never writes inside the installed skill");
});

test("init repairs an incomplete installation without changing its selected location", () => {
  const f = installed({ dependencies: false });
  const first = run(f, "init");
  expect(first.status, first.stderr).toBe(0);
  const before = JSON.parse(first.stdout);
  rmSync(resolve(before.storage.toolchain, "node_modules/knip"), { recursive: true });
  expect(run(f, "doctor").status).toBe(1);
  const repair = run(f, "init");
  expect(repair.status, repair.stderr).toBe(0);
  const after = JSON.parse(repair.stdout);
  expect(after.ready).toBe(true);
  expect(after.installed).toBe(true);
  expect(after.storage.toolchain).toBe(before.storage.toolchain);
  expect(after.storage.config).toEqual(before.storage.config);
}, 45_000);

test("an unsuccessful storage change preserves the previous configuration", () => {
  const f = installed();
  const path = resolve(f.directory, ".510/config.json");
  const before = readFileSync(path, "utf8");
  const blocked = resolve(f.directory, "not-a-directory");
  writeFileSync(blocked, "preserve this file\n");
  expect(run(f, "init", "--storage", blocked).status).toBe(1);
  expect(readFileSync(path, "utf8")).toBe(before);
  expect(readFileSync(blocked, "utf8")).toBe("preserve this file\n");
  expect(run(f, "doctor").status).toBe(0);
});
