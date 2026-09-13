import { existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { createHash } from "node:crypto";

const metadataNames = ["package.json", "tsconfig.json", "jsconfig.json", "bun.lock", "bun.lockb", "package-lock.json", "pnpm-lock.yaml", "yarn.lock", "pnpm-workspace.yaml"];
const packageKeys = ["name", "private", "type", "packageManager", "engines", "exports", "main", "types", "workspaces", "scripts", "dependencies", "devDependencies", "peerDependencies", "browserslist"];

function inside(root, path) {
  const local = relative(root, path);
  return local !== ".." && !local.startsWith(`..${sep}`) && !isAbsolute(local);
}

function metadataObject(content, jsonc = false) {
  const value = jsonc ? Bun.JSON5.parse(content) : JSON.parse(content);
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected a metadata object");
  return value;
}

/** Record source fingerprints and declared configuration without evaluating tooling. */
function inspectMetadata(root, directory, result) {
  for (const name of metadataNames) {
    const file = resolve(directory, name);
    if (!existsSync(file)) continue;
    const path = relative(root, file);
    if (!inside(root, realpathSync(file))) {
      result.gaps.push(`Skipped metadata symlink outside repository: ${file}`);
      if (name === "package.json") result.packages.push({ path, invalid: true });
      continue;
    }
    const content = readFileSync(file);
    result.evidence.push({ path, sha256: createHash("sha256").update(content).digest("hex") });
    try {
      if (name === "package.json") {
        const value = metadataObject(content.toString("utf8"));
        result.packages.push({ path, ...Object.fromEntries(packageKeys.filter((key) => Object.hasOwn(value, key)).map((key) => [key, value[key]])) });
      } else if (name.includes("config.json")) {
        const value = metadataObject(content.toString("utf8"), true);
        const keys = ["compilerOptions", "extends", "references", "files", "include", "exclude"];
        result.configurations.push({ path, ...Object.fromEntries(keys.filter((key) => Object.hasOwn(value, key)).map((key) => [key, value[key]])) });
      } else result.lockfiles.push(path);
    } catch (error) {
      result.gaps.push(`${file}: ${error.message}`);
      if (name === "package.json") result.packages.push({ path, invalid: true });
    }
  }
}

function recommendGuides(owner, packages, lockfiles) {
  const dependencies = { ...owner?.dependencies, ...owner?.devDependencies, ...owner?.peerDependencies };
  const recommendations = [];
  const add = (topic, reason) => recommendations.push({ topic, reason });
  if (owner?.engines?.node || owner?.exports || owner?.main || dependencies["@types/node"]) add("environment-node", "Selected package declares Node support, package entrypoints, or Node types; confirm the actual runtime.");
  if (owner?.browserslist || ["vite", "webpack", "react", "next", "vue", "svelte", "astro"].some((name) => dependencies[name])) add("environment-browser", "Selected package has browser targets or frontend dependencies; confirm the affected execution path.");
  if (dependencies.react || dependencies.next) add("environment-react", "Selected package declares React or Next.js.");
  if (packages.some((item) => item.workspaces) || lockfiles.some((file) => file.endsWith("pnpm-workspace.yaml"))) add("environment-monorepo", "An ancestor declares workspace boundaries.");
  return recommendations;
}

/** Inspect the selected package and ancestors, with no setup, execution, writes, or cached assumptions. */
export function projectProfile(root, path = ".") {
  root = realpathSync(root);
  if (!statSync(root).isDirectory()) throw new Error("Profile root must be a directory.");
  const selected = realpathSync(resolve(root, path));
  if (!inside(root, selected)) throw new Error("Profile path must stay inside the repository.");
  const result = { evidence: [], gaps: [], packages: [], configurations: [], lockfiles: [] };
  let directory = statSync(selected).isDirectory() ? selected : dirname(selected);
  while (true) {
    inspectMetadata(root, directory, result);
    if (directory === root) break;
    directory = dirname(directory);
  }
  const owner = result.packages[0];
  if (!owner) result.gaps.push("No package.json found between the selected path and repository root.");
  return { root, selected: relative(root, selected) || ".", package: owner ?? null, ancestors: result.packages.slice(1),
    configurations: result.configurations, lockfiles: result.lockfiles, evidence: result.evidence,
    recommendations: recommendGuides(owner, result.packages, result.lockfiles), gaps: result.gaps,
    limitations: ["Configuration values are declarations, not fully resolved settings. Read extends/references before changing module behavior.",
      "Only selected-path ancestors are inspected. Select each affected package; custom config filenames may need explicit inspection.",
      "No packages are installed, scripts executed, files created, or results cached. Refresh after metadata changes."] };
}
