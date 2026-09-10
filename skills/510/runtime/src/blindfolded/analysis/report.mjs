import { resolve } from "node:path";

export function finalize(project, analyzers) {
  for (const analyzer of analyzers) {
    analyzer.scope ??= { selectedFiles: project.files };
    for (const item of analyzer.findings) if (item.file) item.file = resolve(project.root, item.file);
  }
  const findings = analyzers.flatMap((analyzer) => analyzer.findings);
  const gaps = analyzers.flatMap((analyzer) => analyzer.gaps.map((message) => ({ tool: analyzer.tool, message })));
  return { schemaVersion: 1, root: project.root, success: findings.length === 0 && gaps.length === 0 && analyzers.every((item) => item.status === "completed"),
    scope: project.scope, files: project.files, thresholds: project.thresholds, analyzers, findings, gaps,
    limitations: ["Source analysis does not prove whole-program purity or correctness.",
      "Effect and testability judgments require the skill's contextual review workflow.",
      "Project tooling configuration may execute; application startup, tests, and build scripts are not invoked."] };
}

export function render(report) {
  const lines = [`Blindfolded: ${report.success ? "PASS" : "FAIL"}`, `${report.findings.length} findings; ${report.gaps.length} coverage gaps.`];
  for (const analyzer of report.analyzers) lines.push(`${analyzer.tool}: ${analyzer.status} (${analyzer.findings.length} findings)`);
  for (const item of report.findings) lines.push(`\n[${item.classification}] ${item.file ?? report.root}${item.line ? `:${item.line}:${item.column ?? 1}` : ""}\n${item.rule}: ${item.message}`);
  for (const gap of report.gaps) lines.push(`\n[Coverage gap] ${gap.tool}: ${gap.message}`);
  return lines.join("\n");
}
