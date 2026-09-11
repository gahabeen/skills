import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { bin, completed, finding, manifest, parseOutput, run } from "./runtime.mjs";

// An isolated source snapshot gives Fallow exactly the suite's selected files.
// Flatten names to avoid framework/test/generated ignores and ambient configs.
function snapshot(project, directory) {
  const root = resolve(directory, "fallow");
  mkdirSync(resolve(root, "node_modules"), { recursive: true });
  writeFileSync(resolve(root, "package.json"), JSON.stringify({ name: "510-source-snapshot", private: true }));
  const configuration = { rules: { "boundary-violation": "off", "policy-violation": "off" },
    duplicates: { ignoreDefaults: false, mode: "mild", minTokens: project.thresholds.duplicateTokens,
      minLines: project.thresholds.duplicateLines, minOccurrences: 2, ignoreImports: true } };
  const config = resolve(root, ".fallowrc.json");
  writeFileSync(config, JSON.stringify(configuration));
  const files = new Map(project.files.map((file, index) => {
    const name = `source-${index}${file.match(/(?:\.d)?\.[^.]+$/)[0]}`;
    copyFileSync(resolve(project.root, file), resolve(root, name));
    return [name, file];
  }));
  return { root, config, files, configuration };
}

function envelope(data, kind, schema) {
  if (data.kind !== kind || data.schema_version !== schema || data.version !== manifest.dependencies.fallow) {
    throw new Error(`Unsupported Fallow ${kind} report: expected ${manifest.dependencies.fallow}, schema ${schema}.`);
  }
}

function location(instance, source) {
  const name = relative(source.root, resolve(source.root, instance.file));
  const file = source.files.get(name);
  if (!file || !Number.isInteger(instance.start_line) || instance.start_line < 1
    || !Number.isInteger(instance.end_line) || instance.end_line < instance.start_line
    || !Number.isInteger(instance.start_col) || instance.start_col < 0
    || !Number.isInteger(instance.end_col) || instance.end_col < 0) {
    throw new Error("Fallow returned an unknown source location.");
  }
  return { file, line: instance.start_line, endLine: instance.end_line, column: instance.start_col + 1, endColumn: instance.end_col + 1 };
}

function cloneFinding(group, source, project) {
  if (!Array.isArray(group.instances) || group.instances.length < 2
    || !Number.isInteger(group.token_count) || !Number.isInteger(group.line_count)) {
    throw new Error("Fallow returned an invalid clone group.");
  }
  const locations = group.instances.map((instance) => location(instance, source));
  const message = `Repeated code: ${group.token_count} tokens across ${locations.length} occurrences (${group.line_count} lines).`;
  return finding("fallow", "duplicate-code", locations[0].file, message, "Review", {
    line: locations[0].line, column: locations[0].column,
    relatedLocations: locations.map((item) => ({ ...item, file: resolve(project.root, item.file) })),
    evidence: locations.map((item) => `${item.file}:${item.line}-${item.endLine}`).join(", "),
    measurement: { tokens: group.token_count, lines: group.line_count,
      minimumTokens: project.thresholds.duplicateTokens, minimumLines: project.thresholds.duplicateLines, mode: "mild" },
    uncertainty: "Similar tokens do not prove shared responsibility or justify an abstraction. Copies outside the selected scope are not compared.",
    action: "Compare each occurrence and its callers. Share code only when responsibilities and behavior should evolve together.",
  });
}

export function fallow(project, directory) {
  const source = snapshot(project, directory);
  const gaps = [];
  const findings = [];
  const executable = bin("fallow", "fallow");
  // Do not inherit per-shell scope filters, baselines, or binary verification bypasses.
  const environment = Object.fromEntries(Object.keys(process.env).filter((name) => name.startsWith("FALLOW_")).map((name) => [name, undefined]));
  environment.FALLOW_VERIFY_CACHE_DIR = resolve(directory, "fallow-verify");
  environment.FALLOW_TELEMETRY_DISABLED = "1";
  const common = ["--root", source.root, "--config", source.config, "--format", "json", "--quiet", "--no-cache",
    "--no-type-aware", "--no-production", "--max-file-size", "0", "--threads", "1"];
  function inspect(args, consume) {
    try {
      const result = run(executable, [...args, ...common], source.root, environment);
      if (result.status !== 0) gaps.push(`Fallow ${args[0]} exited ${result.status}.`);
      if (result.stderr.trim()) gaps.push(result.stderr.trim());
      consume(parseOutput(result, `Fallow ${args[0]}`));
    } catch (error) { gaps.push(error.message); }
  }
  let discoveredFileCount;
  inspect(["list", "--files"], (data) => {
    if (!Array.isArray(data.files) || data.file_count !== source.files.size || data.files.length !== source.files.size
      || new Set(data.files).size !== source.files.size || data.files.some((file) => !source.files.has(file))) {
      throw new Error("Fallow did not discover every selected source file.");
    }
    discoveredFileCount = data.file_count;
  });
  let parsedFileCount;
  // Dupes alone omits parser failures. Health supplies parser diagnostics, not
  // graph or complexity findings: snapshot imports have no project semantics.
  inspect(["health", "--complexity"], (data) => {
    envelope(data, "health", 11);
    parsedFileCount = data.summary?.files_analyzed;
    if (parsedFileCount !== source.files.size) gaps.push("Fallow parser coverage does not match the selected source files.");
    for (const diagnostic of data.workspace_diagnostics ?? []) {
      const file = source.files.get(diagnostic.path) ?? diagnostic.path;
      gaps.push(`${file}: ${diagnostic.kind}: ${diagnostic.message}`);
    }
  });
  let statistics;
  inspect(["dupes", "--no-fragments"], (data) => {
    envelope(data, "dupes", 10);
    if (!Array.isArray(data.clone_groups) || !data.stats) throw new Error("Fallow result is missing clone groups or statistics.");
    statistics = data.stats;
    for (const group of data.clone_groups) {
      try { findings.push(cloneFinding(group, source, project)); }
      catch (error) { gaps.push(error.message); }
    }
    if (data.clone_groups_omitted !== 0 || data.clone_families_omitted !== 0
      || data.clone_groups_shown !== data.clone_groups.length || data.stats.clone_groups !== data.clone_groups.length) {
      gaps.push("Fallow did not return every clone group.");
    }
    for (const diagnostic of data.workspace_diagnostics ?? []) gaps.push(`${diagnostic.kind}: ${diagnostic.message}`);
  });
  return completed(findings, { status: gaps.length ? "incomplete" : "completed", gaps, configuration: source.configuration,
    scope: { selectedFiles: project.files, discoveredFileCount, parsedFileCount,
      eligibleFileCount: statistics?.total_files, comparison: "selected-files-only" }, statistics });
}
