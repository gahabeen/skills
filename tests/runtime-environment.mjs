import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

export function bunOnlyEnvironment(directory) {
  assert.ok(process.versions.bun, "Installed-skill tests must run with Bun.");
  const path = resolve(directory, "empty-path");
  mkdirSync(path);
  const env = { ...process.env, PATH: path };
  assert.equal(spawnSync("node", ["--version"], { env }).error?.code, "ENOENT");
  return env;
}
