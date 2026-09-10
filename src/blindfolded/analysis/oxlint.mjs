import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { bin, completed, finding, parseOutput, resolveTool, run } from "./runtime.mjs";

const rules = ["no-array-filter-map", "no-reduce-accumulator-copy", "no-chained-type-assertions", "no-conditional-empty-object-spread",
  "no-known-value-widening", "no-module-mocking", "no-object-parameters", "no-reflect-apply", "no-reflect-get", "no-runtime-typeof",
  "no-shape-in-symbol-names", "no-unknown-parameters", "no-unknown-returns", "no-unknown-type-aliases", "no-unsafe-dictionary-type",
  "no-widen-then-assert", "require-readable-spacing", "require-safety-comment-for-type-assertion"];

function diagnostic(project, item) {
  const rule = item.code ?? "oxlint/parser";
  const review = /(?:complexity|max-depth)/.test(rule);
  const policy = rule.startsWith("blindfolded") || rule.includes("switch-exhaustiveness") || item.message.includes("compiler option");
  const span = item.labels?.[0]?.span;
  const score = item.message.match(/complexity of (\d+)/i);
  return finding("oxlint", rule, item.filename, item.message, review ? "Review" : policy ? "Enforce" : "Fix", {
    line: span?.line ?? null, column: span?.column ?? null, severity: item.severity,
    ...(score ? { measurement: { value: Number(score[1]), limit: project.thresholds.cyclomatic, variant: "classic" } } : {}),
    ...(rule.includes("max-depth") ? { measurement: { limit: project.thresholds.nesting } } : {}),
  });
}

function typedCoverage(stderr, gaps) {
  const assignments = [...stderr.matchAll(/Done assigning files to programs\. Total programs: (\d+)\. Unmatched files: (\d+)/g)];
  if (!assignments.length) gaps.push("The typed backend did not confirm file-to-project coverage.");
  for (const match of assignments) {
    if (Number(match[2]) > 0) gaps.push(`The typed backend could not assign ${match[2]} selected files to a compiler project.`);
  }
  const programs = [...stderr.matchAll(/Program (.+): (\d+) files/g)].map((match) => ({ configuration: match[1], files: Number(match[2]) }));
  // Version-pinned debug logs establish coverage; preserve them as evidence.
  const other = stderr.split(/\r?\n/).filter((line) => line.trim()
    && !/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}\.\d+ /.test(line)
    && !/^\d{4}-\d{2}-\d{2}T\S+ (?:DEBUG|TRACE|INFO) /.test(line));
  if (other.length) gaps.push(other.join("\n"));
  return { programs, log: stderr };
}

export function oxlint(project, directory, prepared) {
  const configPath = resolve(directory, "oxlint.json");
  const config = {
    ...(project.settings.oxlintConfig ? { extends: [resolve(project.root, project.settings.oxlintConfig)] } : {}),
    plugins: ["typescript", "oxc"],
    jsPlugins: [{ name: "blindfolded", specifier: resolve(directory, "rules/index.ts") }],
    categories: { correctness: "error" },
    rules: { ...Object.fromEntries(rules.map((name) => [`blindfolded/${name}`, "error"])),
      "oxc/no-accumulating-spread": "error",
      "typescript/no-floating-promises": ["error", { ignoreVoid: false }],
      "typescript/no-misused-promises": "error",
      "typescript/switch-exhaustiveness-check": ["error", { considerDefaultExhaustiveForUnions: false }],
      "eslint/complexity": ["warn", { max: project.thresholds.cyclomatic, variant: "classic" }],
      "eslint/max-depth": ["warn", { max: project.thresholds.nesting }] },
  };
  writeFileSync(configPath, JSON.stringify(config));
  const findings = new Map();
  const gaps = [...prepared.gaps];
  const coverage = [];
  // Syntax/scope checks still run when typed configuration cannot be prepared.
  const groups = prepared.configs.length ? prepared.configs : [{ files: project.files, path: null }];
  for (const group of groups) {
    try {
      const result = run(bin("oxlint", "oxlint"), ["--config", configPath, "--no-ignore", "--disable-nested-config", "--deny-warnings", "--threads", "1",
        "--format", "json", ...(group.path ? ["--type-aware", "--type-check", "--tsconfig", group.path] : []), ...group.files], project.root,
        group.path ? { OXC_LOG: "debug", OXLINT_TSGOLINT_PATH: resolveTool(`@oxlint-tsgolint/${process.platform}-${process.arch}/tsgolint${process.platform === "win32" ? ".exe" : ""}`, project.root) } : {});
      const output = parseOutput(result, "Oxlint");
      if (!Array.isArray(output.diagnostics)) throw new Error("Oxlint result is missing diagnostics.");
      if (output.number_of_files !== group.files.length) gaps.push(`Oxlint inspected ${output.number_of_files} of ${group.files.length} selected files.`);
      for (const item of output.diagnostics) {
        const record = diagnostic(project, item);
        findings.set(JSON.stringify(record), record);
        if (!item.code || /parser|parse-error/.test(item.code)) gaps.push(`Oxlint could not parse ${item.filename ?? "source"}: ${item.message}`);
        if (/requires the .+ compiler option/.test(item.message)) gaps.push(`Typed check unavailable under the application's compiler settings: ${item.message}`);
      }
      if (result.status > 1 || (result.status !== 0 && output.diagnostics.length === 0)) gaps.push(`Oxlint exit ${result.status}: ${result.stderr || result.stdout}`);
      if (group.path) coverage.push(typedCoverage(result.stderr, gaps));
      else if (result.stderr.trim()) gaps.push(result.stderr.trim());
    } catch (error) { gaps.push(error.message); }
  }
  return completed([...findings.values()], { status: gaps.length ? "incomplete" : "completed", gaps, configuration: config,
    scope: { selectedFiles: project.files, typedCoverage: coverage } });
}
