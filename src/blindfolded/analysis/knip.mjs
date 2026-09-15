import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { configuration } from "./configuration.mjs";
import { inside, pathPattern } from "./project.mjs";
import { bin, completed, finding, packagePath, parseOutput, run } from "./runtime.mjs";

async function knipConfiguration(project) {
  let config = await configuration(project.root, project.settings.knipConfig,
    ["knip.json", "knip.jsonc", ".knip.json", ".knip.jsonc", "knip.ts", "knip.js", "knip.config.ts", "knip.config.js"]);
  const packageFile = resolve(project.root, "package.json");
  if (!Object.keys(config).length && existsSync(packageFile)) config = JSON.parse(readFileSync(packageFile, "utf8")).knip ?? {};
  const patterns = project.scope.paths.map((path) => statSync(resolve(project.root, path)).isDirectory()
    ? `${pathPattern(path)}/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}` : pathPattern(path));
  const exclusions = [...project.scope.excludedDirectories.map((name) => `!**/${name}/**`), ...project.scope.ignore.map((pattern) => `!${pattern}`)];
  exclusions.push(...project.scope.excludedPaths.map((path) => `!${path}/**`));
  if (project.scope.installedSkill) exclusions.push(`!${project.scope.installedSkill}/**`);
  const required = ["files", "dependencies", "devDependencies", "optionalPeerDependencies", "unlisted", "unresolved", "exports", "types", "nsExports", "nsTypes"];
  return { ...config, project: [...patterns, ...exclusions],
    ...(config.include ? { include: [...new Set([...config.include, ...required])] } : {}),
    ...(config.exclude ? { exclude: config.exclude.filter((type) => !required.includes(type)) } : {}),
    rules: { ...config.rules, ...Object.fromEntries(required.map((type) => [type, "error"])) } };
}

// Use the pinned Knip resolver so manifest, pnpm, and configured workspace rules agree.
async function scopeWorkspaces(project, config, path) {
  if (project.scope.pathSource !== "request") return [];
  const knipRoot = packagePath("knip", project.root);
  const [{ createOptions }, { ConfigurationChief }, { workspaceConfigurationSchema }] = await Promise.all([
    import(pathToFileURL(resolve(knipRoot, "dist/util/create-options.js")).href),
    import(pathToFileURL(resolve(knipRoot, "dist/ConfigurationChief.js")).href),
    import(pathToFileURL(resolve(knipRoot, "dist/schema/configuration.js")).href),
  ]);
  const chief = new ConfigurationChief(await createOptions({ cwd: project.root, args: { config: path } }));
  await chief.getWorkspaces();
  function workspaceConfig(name) {
    const settings = name === "." ? { ...config, ...chief.getWorkspaceConfig(name) } : chief.getWorkspaceConfig(name);
    return Object.fromEntries(Object.entries(settings)
      .filter(([key]) => Object.hasOwn(workspaceConfigurationSchema.shape, key)));
  }
  const selected = new Map();
  for (const file of project.files) {
    const workspace = chief.findWorkspaceByFilePath(resolve(project.root, file));
    if (!workspace) throw new Error(`No Knip workspace covers selected file: ${file}`);
    selected.set(workspace.name, workspace);
  }
  const workspaces = { ...config.workspaces, ".": { ...workspaceConfig("."), project: [] } };
  for (const [name, workspace] of selected) {
    const paths = project.scope.paths.flatMap((path) => {
      const absolute = resolve(project.root, path);
      if (inside(absolute, workspace.dir)) return ["."];
      return inside(workspace.dir, absolute) ? [relative(workspace.dir, absolute)] : [];
    });
    const patterns = paths.map((path) => statSync(resolve(workspace.dir, path)).isDirectory()
      ? `${pathPattern(path)}/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}` : pathPattern(path));
    const exclusions = config.project.filter((pattern) => pattern.startsWith("!"))
      .map((pattern) => `!${relative(workspace.dir, resolve(project.root, pattern.slice(1)))}`);
    workspaces[name] = { ...workspaceConfig(name), project: [...new Set([...patterns, ...exclusions])] };
  }
  // Root entry settings belong in the root workspace when a workspace map is present.
  delete config.entry;
  delete config.project;
  config.workspaces = workspaces;
  writeFileSync(path, JSON.stringify(config));
  return [...selected.keys()];
}

function knipFindings(data) {
  if (!Array.isArray(data.findings)) throw new Error("Knip result is missing issues.");
  const findings = data.findings.map((item) => finding("knip", item.type, item.filePath,
    `${item.type}: ${item.symbols ? item.symbols.map((symbol) => symbol.symbol).join(", ") : item.symbol}`, "Review", {
      line: item.line ?? null, column: item.col ?? null,
      uncertainty: "Reachability depends on configured entry points and framework discovery; verify dynamic loading before removal." }));
  for (const hint of [...data.configurationHints, ...data.tagHints]) {
    findings.push(finding("knip", `configuration/${hint.type}`, hint.filePath, `${hint.type}: ${hint.identifier}`, "Review"));
  }
  return findings;
}

export async function knip(project, directory) {
  const config = await knipConfiguration(project);
  const path = resolve(directory, "knip.json");
  writeFileSync(path, JSON.stringify(config));
  const workspaces = await scopeWorkspaces(project, config, path);
  const result = await run(bin("knip", "knip"), ["--config", path, "--no-progress", "--reporter", fileURLToPath(new URL("knip-reporter.mjs", import.meta.url)), "--treat-config-hints-as-errors", "--treat-tag-hints-as-errors",
    ...workspaces.flatMap((workspace) => ["--workspace", workspace === "." ? "." : `./${workspace}`])], project.root);
  const data = parseOutput(result, "Knip");
  const findings = knipFindings(data);
  const gaps = [];
  if (result.status > 1 || (result.status !== 0 && !findings.length)) gaps.push(`Knip exit ${result.status}: ${result.stderr || result.stdout}`);
  if (result.stderr.trim()) gaps.push(result.stderr.trim());
  if (data.hasConfigLoadErrors) gaps.push("Knip could not load every tooling configuration.");
  if (!data.counters?.processed) gaps.push("Knip did not process any source files; check entry points and workspace configuration.");
  if (findings.some((item) => item.rule === "unresolved")) gaps.push("Knip could not resolve every dependency.");
  return completed(findings, { status: gaps.length ? "incomplete" : "completed", gaps, configuration: config,
    scope: { counters: data.counters, enabledPlugins: data.enabledPlugins, includesDiscoveredEntryPoints: true,
      selectedWorkspaces: data.selectedWorkspaces, includedWorkspaceDirs: data.includedWorkspaceDirs } });
}
