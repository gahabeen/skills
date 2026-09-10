import { createHash } from "node:crypto";
import { existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { bundledToolchain, skillRoot } from "./paths.mjs";

export const manifestSource = readFileSync(resolve(bundledToolchain, "package.json"));
export const lockSource = readFileSync(resolve(bundledToolchain, "bun.lock"));
export const toolchainKey = createHash("sha256").update(manifestSource).update(lockSource)
  .update(`${process.platform}/${process.arch}/${process.versions.bun}`).digest("hex").slice(0, 24);

export function contains(root, path) {
  const name = relative(root, path);
  return name !== ".." && !name.startsWith(`..${sep}`) && !isAbsolute(name);
}

function canonical(path) {
  if (existsSync(path)) return realpathSync(path);
  return resolve(canonical(dirname(path)), relative(dirname(path), path));
}

export function writablePath(path) {
  const resolved = canonical(resolve(path));
  if (contains(canonical(skillRoot), resolved)) throw new Error("510 never writes inside the installed skill. Choose a different storage path.");
  return resolved;
}

export function projectRoot(input) {
  let root = realpathSync(input ?? process.cwd());
  if (!statSync(root).isDirectory()) throw new Error("Project root must be a directory.");
  if (input) return root;
  let packageRoot;
  for (;;) {
    if (existsSync(resolve(root, ".510/config.json")) || existsSync(resolve(root, ".git"))) return root;
    if (!packageRoot && existsSync(resolve(root, "package.json"))) packageRoot = root;
    const parent = dirname(root);
    if (parent === root) return packageRoot ?? realpathSync(process.cwd());
    root = parent;
  }
}

export function readConfiguration(root) {
  const path = resolve(root, ".510/config.json");
  if (!existsSync(path)) return { version: 1, storage: { mode: "project" } };
  const config = JSON.parse(readFileSync(path, "utf8"));
  if (!config || typeof config !== "object" || Array.isArray(config) || config.version !== 1) {
    throw new Error("Expected .510/config.json version 1.");
  }
  for (const key of Object.keys(config)) {
    if (!["version", "storage", "analysis"].includes(key)) throw new Error(`Unknown .510/config.json option: ${key}.`);
  }
  if (config.analysis !== undefined && (!config.analysis || typeof config.analysis !== "object" || Array.isArray(config.analysis))) {
    throw new Error(".510/config.json analysis must be an object.");
  }
  return config;
}

export function storageChoice(value) {
  if (!value?.trim()) throw new Error("--storage requires project, shared, or a directory path.");
  return ["project", "shared"].includes(value) ? { mode: value } : { mode: "custom", path: value };
}

export function storageFor(input, config) {
  const root = projectRoot(input);
  config ??= readConfiguration(root);
  const storage = config.storage ?? { mode: "project" };
  if (!storage || !["project", "shared", "custom"].includes(storage.mode)
    || Object.keys(storage).some((key) => !["mode", "path"].includes(key))
    || (storage.mode === "custom" ? typeof storage.path !== "string" || !storage.path.trim() : storage.path !== undefined)) {
    throw new Error("Invalid storage settings: choose project, shared, or custom with a path.");
  }
  const configDirectory = writablePath(resolve(root, ".510"));
  const base = writablePath(storage.mode === "project" ? configDirectory
    : storage.mode === "shared" ? resolve(homedir(), ".510")
      : resolve(root, storage.path.startsWith("~/") ? resolve(homedir(), storage.path.slice(2)) : storage.path));
  if (base === root) throw new Error("Storage must use a dedicated directory, not the project root itself.");
  const projectKey = createHash("sha256").update(root).digest("hex").slice(0, 24);
  const projectData = storage.mode === "project" ? base : writablePath(resolve(base, "projects", projectKey));
  return { root, config: { ...config, storage }, configDirectory, configPath: writablePath(resolve(configDirectory, "config.json")),
    base, projectData, toolchainKey, toolchains: writablePath(resolve(base, "toolchains")),
    toolchain: writablePath(resolve(base, "toolchains", toolchainKey)),
    cache: writablePath(resolve(projectData, "cache")), reports: writablePath(resolve(projectData, "reports")),
    temporary: writablePath(resolve(projectData, "tmp")), connectionPath: writablePath(resolve(configDirectory, "mcp.json")) };
}

export function workflowPaths(input) {
  const { root, config, configPath, base, projectData } = storageFor(input);
  function destination(name) {
    const path = writablePath(resolve(projectData, name));
    if (!contains(projectData, path)) throw new Error(`Workflow directory ${name} leaves the configured project storage.`);
    return path;
  }
  return { root, configPath, storage: config.storage, base, projectData,
    specs: destination("specs"), debug: destination("debug") };
}
