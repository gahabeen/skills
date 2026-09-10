import { existsSync, globSync, readFileSync, statSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { skillRoot } from "../../runtime/paths.mjs";
import { readConfiguration, storageFor } from "../../runtime/storage.mjs";

const excludedDirectories = new Set(["node_modules", ".git", ".510", ".blindfolded", "dist", "build", "coverage", ".next", ".nuxt", ".agents", ".codex"]);
const sourceExtension = /\.(?:[cm]?[jt]s|[jt]sx)$/;
const embeddedExtension = /\.(?:vue|svelte|astro)$/;

export function inside(root, path) {
  const name = relative(root, path);
  return name !== ".." && !name.startsWith(`..${sep}`) && !isAbsolute(name);
}

function strings(value, field) {
  if (!Array.isArray(value) || !value.length || value.some((item) => typeof item !== "string" || !item.length)) {
    throw new Error(`${field} must be a nonempty array of paths or patterns.`);
  }
  return value;
}

function readSettings(root) {
  const path = resolve(root, ".blindfolded.json");
  const settings = readConfiguration(root).analysis ?? (existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {});
  const allowed = new Set(["paths", "ignore", "projects", "thresholds", "knipConfig", "dependencyConfig", "oxlintConfig"]);
  for (const key of Object.keys(settings)) {
    if (!allowed.has(key)) throw new Error(`Unknown analysis option: ${key}. Analyzers cannot be disabled.`);
  }
  const paths = strings(settings.paths ?? ["."], "paths");
  const ignores = settings.ignore ?? [];
  if (!Array.isArray(ignores) || ignores.some((item) => typeof item !== "string")) throw new Error("ignore must be an array of patterns.");
  const thresholds = { cyclomatic: 20, nesting: 4, cognitive: 15, ...settings.thresholds };
  for (const [key, value] of Object.entries(thresholds)) {
    if (!["cyclomatic", "nesting", "cognitive"].includes(key) || !Number.isInteger(value) || value < 1) {
      throw new Error(`Invalid threshold ${key}: expected a positive integer.`);
    }
  }
  return { settings, paths, ignores, thresholds };
}

function sourceFiles(root, paths, ignores, excluded) {
  const ignored = new Set(globSync(ignores, { cwd: root, exclude: excluded }));
  const files = new Set();
  const unsupported = new Set();
  for (const path of paths) {
    const absolute = resolve(root, path);
    if (!inside(root, absolute) || !existsSync(absolute)) throw new Error(`Source path is missing or outside the project: ${path}`);
    const candidates = statSync(absolute).isDirectory()
      ? globSync(`${relative(root, absolute) || "."}/**/*`, { cwd: root, exclude: excluded })
      : [relative(root, absolute)];
    for (const candidate of candidates) {
      if (excluded(candidate) || ignored.has(candidate) || !statSync(resolve(root, candidate)).isFile()) continue;
      if (sourceExtension.test(candidate)) files.add(candidate);
      if (embeddedExtension.test(candidate)) unsupported.add(candidate);
    }
  }
  if (!files.size) throw new Error("No JavaScript or TypeScript source files were selected.");
  return { files: [...files].sort(), unsupported: [...unsupported].sort() };
}

export function readProject(root) {
  const { settings, paths, ignores, thresholds } = readSettings(root);
  const storage = storageFor(root);
  const generated = [storage.toolchains, resolve(storage.base, "projects"), storage.cache, storage.reports, storage.temporary];
  const excludedPaths = generated.filter((path) => inside(root, path)).map((path) => relative(root, path));
  function excluded(path) {
    const absolute = resolve(root, path);
    return !inside(root, absolute) || inside(skillRoot, absolute) || generated.some((directory) => inside(directory, absolute))
      || path.split(/[\\/]/).some((part) => excludedDirectories.has(part));
  }
  const sources = sourceFiles(root, paths, ignores, excluded);
  const projects = settings.projects
    ? strings(settings.projects, "projects")
    : globSync(["**/tsconfig*.json", "**/jsconfig*.json"], { cwd: root, exclude: excluded });
  for (const path of projects) {
    if (!inside(root, resolve(root, path)) || !existsSync(resolve(root, path))) throw new Error(`Missing project configuration: ${path}`);
  }
  return { root, ...sources, projects: [...new Set(projects)].sort(), thresholds,
    settings, scope: { paths, ignore: ignores, excludedDirectories: [...excludedDirectories], excludedPaths,
      installedSkill: inside(root, skillRoot) ? relative(root, skillRoot) : null } };
}
