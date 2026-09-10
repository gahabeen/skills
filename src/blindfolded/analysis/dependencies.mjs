import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { configuration } from "./configuration.mjs";
import { bin, completed, finding, parseOutput, run } from "./runtime.mjs";

function dependencyPolicy(config, project) {
  const required = [
    { name: "blindfolded/no-cycles", severity: "warn", from: {}, to: { circular: true } },
    { name: "blindfolded/no-unresolved", severity: "error", from: {}, to: { couldNotResolve: true } },
  ];
  return { ...config, forbidden: [...(config.forbidden ?? []), ...required],
    options: { ...config.options, doNotFollow: { path: "node_modules" }, tsPreCompilationDeps: true,
      enhancedResolveOptions: { exportsFields: ["exports"], conditionNames: ["import", "require", "node", "default", "types"],
        mainFields: ["module", "main", "types", "typings"], ...config.options?.enhancedResolveOptions },
      builtInModules: { ...config.options?.builtInModules,
        add: [...new Set([...(config.options?.builtInModules?.add ?? []), "bun", "bun:test", "bun:sqlite", "bun:ffi", "bun:jsc"])] },
      ...(project.projects.length === 1 ? { tsConfig: { fileName: resolve(project.root, project.projects[0]) } } : {}) } };
}

export async function dependencies(project, directory) {
  const config = await configuration(project.root, project.settings.dependencyConfig,
    [".dependency-cruiser.cjs", ".dependency-cruiser.js", ".dependency-cruiser.mjs", ".dependency-cruiser.json"]);
  const policy = dependencyPolicy(config, project);
  const path = resolve(directory, "dependencies.json");
  writeFileSync(path, JSON.stringify(policy));
  const result = run(bin("dependency-cruiser", "depcruise"), ["--config", path, "--output-type", "json", ...project.files], project.root);
  const data = parseOutput(result, "Dependency-cruiser");
  if (!Array.isArray(data.summary?.violations)) throw new Error("Dependency-cruiser result is missing violations.");
  const findings = data.summary.violations.map((item) => finding("dependency-cruiser", item.rule.name, item.from,
    `${item.from} → ${item.to}: ${item.rule.name}`, item.rule.name === "blindfolded/no-cycles" ? "Review" : "Enforce",
    { evidence: item, relatedFiles: [item.to], severity: item.rule.severity }));
  const gaps = [];
  const inspected = new Set((data.modules ?? []).map((module) => resolve(project.root, module.source)));
  for (const file of project.files) if (!inspected.has(resolve(project.root, file))) gaps.push(`Dependency graph omitted selected file: ${file}`);
  if (result.status > 1 || (result.status !== 0 && !findings.length)) gaps.push(`Dependency-cruiser exit ${result.status}: ${result.stderr || result.stdout}`);
  if (result.stderr.trim()) gaps.push(result.stderr.trim());
  if (findings.some((item) => item.rule === "blindfolded/no-unresolved")) gaps.push("Dependency resolution is incomplete.");
  return completed(findings, { status: gaps.length ? "incomplete" : "completed", gaps, configuration: policy,
    graph: data.modules, architecture: config.forbidden?.length ? "Project rules loaded" : "No project-specific boundary rules declared; cycles and resolution checked" });
}
