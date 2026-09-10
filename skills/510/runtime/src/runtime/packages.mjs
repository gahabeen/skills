import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { manifestSource, storageFor } from "./storage.mjs";

export const manifest = JSON.parse(manifestSource.toString());
export function packagePath(name, root) { return resolve(storageFor(root).toolchain, "node_modules", name); }
export function requireTool(name, root) { return createRequire(resolve(storageFor(root).toolchain, "package.json"))(name); }
export function resolveTool(name, root) { return createRequire(resolve(storageFor(root).toolchain, "package.json")).resolve(name); }
export function loadTool(name, root) {
  const dependency = name.split("/").slice(0, name.startsWith("@") ? 2 : 1).join("/");
  const status = checkPackage(dependency, manifest.dependencies[dependency], storageFor(root).toolchain);
  if (!status.ready) throw new Error(`${dependency}: expected ${status.expected}, installed ${status.installed ?? "missing"}. Run 510 init.`);
  return import(pathToFileURL(resolveTool(name, root)).href);
}

function checkPackage(name, specification, directory) {
  const expected = specification.replace(/^npm:[^@]+@/, "");
  try {
    const { version } = JSON.parse(readFileSync(resolve(directory, "node_modules", name, "package.json"), "utf8"));
    return { name, expected, installed: version, ready: version === expected };
  } catch (error) {
    return { name, expected, installed: null, ready: false, error: error.message };
  }
}

export function checkPackages(directory = storageFor().toolchain) {
  return Object.entries(manifest.dependencies).map(([name, specification]) => checkPackage(name, specification, directory));
}
