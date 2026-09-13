import { afterEach, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { readGuide } from "../src/runtime/guides.mjs";
import { projectProfile } from "../src/runtime/profile.mjs";

const directories = [];
afterEach(() => { for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true }); });
function project() { const path = mkdtempSync(resolve(tmpdir(), "510-guidance-")); directories.push(path); return path; }

test("guide retrieval selects phases and individual diagnostics without expanding other instructions", () => {
  const overview = readGuide("implement");
  const build = readGuide("implement", { phase: "build" });
  const verify = readGuide("implement", { phase: "verify" });
  expect(build.phase).toBe("build");
  expect(build.markdown).not.toBe(overview.markdown);
  expect(verify.markdown).not.toBe(build.markdown);
  const rule = readGuide("rules", { rule: "blindfolded(no-unknown-parameters)" });
  expect(rule.rule).toBe("no-unknown-parameters");
  expect(rule.markdown).not.toContain("### `no-unknown-returns`");
  expect(rule.markdown.length).toBeLessThan(readGuide("rules").markdown.length / 2);
  for (const selection of [{ phase: "../../package" }, { phase: "build", rule: "no-runtime-typeof" }]) expect(() => readGuide("implement", selection)).toThrow();
  expect(() => readGuide("output", { rule: "no-runtime-typeof" })).toThrow();
  expect(() => readGuide("rules", { rule: "../../package" })).toThrow();
});

test("profile selects the owning package, preserves commands, and changes evidence when metadata changes", () => {
  const root = project();
  mkdirSync(resolve(root, "packages/web/src"), { recursive: true });
  writeFileSync(resolve(root, "package.json"), JSON.stringify({ workspaces: ["packages/*"], dependencies: { next: "root-only" } }));
  const file = resolve(root, "packages/web/package.json");
  writeFileSync(resolve(root, "packages/web/tsconfig.json"), '{ // JSONC is data, never executed\n "extends": "../../tsconfig.base.json", "compilerOptions": { "module": "esnext", }, }');
  writeFileSync(file, JSON.stringify({ name: "web", packageManager: "pnpm@10", scripts: { build: "do-not-run" }, dependencies: { react: "19", vite: "7" } }));
  const first = projectProfile(root, "packages/web/src");
  expect(first.package.name).toBe("web");
  expect(first.package.scripts.build).toBe("do-not-run");
  expect(first.recommendations.map((item) => item.topic)).toEqual(["environment-browser", "environment-react", "environment-monorepo"]);
  expect(first.package.dependencies.next).toBeUndefined();
  expect(first.configurations[0].compilerOptions.module).toBe("esnext");
  expect(first.configurations[0].extends).toBe("../../tsconfig.base.json");
  expect(existsSync(resolve(root, ".fiveten"))).toBe(false);
  writeFileSync(file, JSON.stringify({ name: "web", engines: { node: ">=22" } }));
  const next = projectProfile(root, "packages/web");
  expect(next.evidence).not.toEqual(first.evidence);
  expect(next.recommendations.map((item) => item.topic)).toEqual(["environment-node", "environment-monorepo"]);
});

test("profile reports malformed metadata and excludes symlinks outside the repository", () => {
  const root = project();
  const outside = project();
  writeFileSync(resolve(root, "package.json"), "broken json");
  writeFileSync(resolve(outside, "tsconfig.json"), "{}");
  symlinkSync(resolve(outside, "tsconfig.json"), resolve(root, "tsconfig.json"));
  const result = projectProfile(root);
  expect(result.gaps.length).toBeGreaterThanOrEqual(2);
  expect(result.configurations).toEqual([]);
  expect(() => projectProfile(root, outside)).toThrow("inside");
});
