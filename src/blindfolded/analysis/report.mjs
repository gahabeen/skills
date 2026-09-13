import { resolve } from "node:path";
import { identifyFindings, findingGroups, configurationIdentity } from "./findings.mjs";

export function finalize(project, analyzers, directory) {
  for (const analyzer of analyzers) {
    analyzer.scope ??= { selectedFiles: project.files };
    for (const item of analyzer.findings) if (item.file) item.file = resolve(project.root, item.file);
  }
  const findings = analyzers.flatMap((analyzer) => analyzer.findings);
  const gaps = analyzers.flatMap((analyzer) => analyzer.gaps.map((message) => ({ tool: analyzer.tool, message })));
  const identityVersion = identifyFindings(project.root, findings);
  return { schemaVersion: 2, identityVersion, policyVersion: "510-boundaries-1", configurationId: configurationIdentity(project, analyzers, directory), root: project.root, success: findings.length === 0 && gaps.length === 0 && analyzers.every((item) => item.status === "completed"),
    scope: project.scope, files: project.files, thresholds: project.thresholds, analyzers, findings, gaps,
    limitations: ["Source analysis does not prove whole-program purity or correctness.",
      "Effect and testability judgments require the skill's contextual review workflow.",
      "Project tooling configuration may execute; application startup, tests, and build scripts are not invoked."] };
}

export function render(report, { grouped = false } = {}) {
  const lines = [`Blindfolded: ${report.success ? "PASS" : "FAIL"}`, `${report.findings.length} findings; ${report.gaps.length} coverage gaps.`];
  if (report.scope.paths) lines.push(`Source scope: ${report.scope.paths.join(", ")} (${report.files.length} selected files)`);
  for (const analyzer of report.analyzers) lines.push(`${analyzer.tool}: ${analyzer.status} (${analyzer.findings.length} findings)`);
  if (grouped) {
    for (const group of findingGroups(report.findings)) lines.push(`\n[${group.classification}] ${group.rule}: ${group.count} findings (group ${group.id})`);
    lines.push("\nGrouped summary only. Retrieve every group's findings and locations from the full report before completing review.");
  } else {
    for (const item of report.findings) lines.push(`\n[${item.classification}; ${item.change}] ${item.file ?? report.root}${item.line ? `:${item.line}:${item.column ?? 1}` : ""}\n${item.rule}: ${item.message}\nFinding: ${item.id}`);
  }
  for (const gap of report.gaps) lines.push(`\n[Coverage gap] ${gap.tool}: ${gap.message}`);
  return lines.join("\n");
}
