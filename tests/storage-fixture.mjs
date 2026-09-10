import { chmodSync, cpSync, existsSync, mkdirSync, readdirSync, symlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { storageFor } from "../src/runtime/storage.mjs";

const repository = fileURLToPath(new URL("../", import.meta.url));

export function provisionStorage(skill, project, { missingKnip = false, storage } = {}) {
  mkdirSync(resolve(project, ".510"), { recursive: true });
  writeFileSync(resolve(project, ".510/config.json"), JSON.stringify({ version: 1, storage: storage ?? { mode: "project" } }));
  const paths = storageFor(project);
  mkdirSync(paths.toolchain, { recursive: true });
  for (const file of ["package.json", "bun.lock"]) cpSync(resolve(skill, "runtime/toolchain", file), resolve(paths.toolchain, file));
  const dependencies = resolve(storageFor(repository).toolchain, "node_modules");
  const installed = resolve(paths.toolchain, "node_modules");
  if (existsSync(installed) && !missingKnip) return paths;
  if (missingKnip) {
    mkdirSync(installed);
    for (const name of readdirSync(dependencies)) if (name !== "knip") symlinkSync(resolve(dependencies, name), resolve(installed, name));
  } else symlinkSync(dependencies, installed, "dir");
  return paths;
}

export function skillPermissions(directory, writable) {
  chmodSync(directory, writable ? 0o755 : 0o555);
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) skillPermissions(path, writable);
    else chmodSync(path, writable ? 0o644 : 0o444);
  }
}
