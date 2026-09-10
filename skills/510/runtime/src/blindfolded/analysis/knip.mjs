import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { configuration } from "./configuration.mjs";
import { bin, completed, finding, parseOutput, run } from "./runtime.mjs";

async function knipConfiguration(project) {
  let config = await configuration(project.root, project.settings.knipConfig,
    ["knip.json", "knip.jsonc", ".knip.json", ".knip.jsonc", "knip.ts", "knip.js", "knip.config.ts", "knip.config.js"]);
  const packageFile = resolve(project.root, "package.json");
  if (!Object.keys(config).length && existsSync(packageFile)) config = JSON.parse(readFileSync(packageFile, "utf8")).knip ?? {};
  const patterns = project.scope.paths.map((path) => statSync(resolve(project.root, path)).isDirectory()
    ? `${path}/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}` : path);
  const exclusions = [...project.scope.excludedDirectories.map((name) => `!**/${name}/**`), ...project.scope.ignore.map((pattern) => `!${pattern}`)];
  exclusions.push(...project.scope.excludedPaths.map((path) => `!${path}/**`));
  if (project.scope.installedSkill) exclusions.push(`!${project.scope.installedSkill}/**`);
  const required = ["files", "dependencies", "devDependencies", "optionalPeerDependencies", "unlisted", "unresolved", "exports", "types", "nsExports", "nsTypes"];
  return { ...config, project: [...patterns, ...exclusions],
    ...(config.include ? { include: [...new Set([...config.include, ...required])] } : {}),
    ...(config.exclude ? { exclude: config.exclude.filter((type) => !required.includes(type)) } : {}),
    rules: { ...config.rules, ...Object.fromEntries(required.map((type) => [type, "error"])) } };
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
  const result = run(bin("knip", "knip"), ["--config", path, "--no-progress", "--reporter", fileURLToPath(new URL("knip-reporter.mjs", import.meta.url)), "--treat-config-hints-as-errors", "--treat-tag-hints-as-errors"], project.root);
  const data = parseOutput(result, "Knip");
  const findings = knipFindings(data);
  const gaps = [];
  if (result.status > 1 || (result.status !== 0 && !findings.length)) gaps.push(`Knip exit ${result.status}: ${result.stderr || result.stdout}`);
  if (result.stderr.trim()) gaps.push(result.stderr.trim());
  if (data.hasConfigLoadErrors) gaps.push("Knip could not load every tooling configuration.");
  if (!data.counters?.processed) gaps.push("Knip did not process any source files; check entry points and workspace configuration.");
  if (findings.some((item) => item.rule === "unresolved")) gaps.push("Knip could not resolve every dependency.");
  return completed(findings, { status: gaps.length ? "incomplete" : "completed", gaps, configuration: config,
    scope: { counters: data.counters, enabledPlugins: data.enabledPlugins, includesDiscoveredEntryPoints: true } });
}
