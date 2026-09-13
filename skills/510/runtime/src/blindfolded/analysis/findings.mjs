import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { relative, resolve } from "node:path";

const identityVersion = 1;
const digest = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 24);
const local = (root, file) => file ? relative(root, resolve(root, file)).replaceAll("\\", "/") : null;

/** Fingerprint recorded settings without checkout or temporary-directory identity. */
export function configurationIdentity(project, analyzers, directory) {
  function normalize(value) {
    if (typeof value === "string") return (directory ? value.replaceAll(directory, "<analysis>") : value).replaceAll(project.root, "<root>");
    if (Array.isArray(value)) return value.map(normalize);
    if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, normalize(value[key])]));
    return value;
  }
  return digest(normalize({ settings: project.settings ?? {}, thresholds: project.thresholds,
    analyzers: [...analyzers].sort((a, b) => a.tool.localeCompare(b.tool)).map(({ tool, configuration }) => ({ tool, configuration })) }));
}

/** Assign checkout-independent identities; repeated identical diagnostics retain occurrence order. */
export function identifyFindings(root, findings) {
  const occurrences = new Map();
  const ordered = [...findings].sort((a, b) => (a.file ?? "").localeCompare(b.file ?? "") || (a.line ?? 0) - (b.line ?? 0) || (a.column ?? 0) - (b.column ?? 0));
  for (const item of ordered) {
    const fingerprint = digest([item.tool, item.rule, local(root, item.file), item.message.replaceAll(root, "<root>"),
      (item.relatedLocations ?? []).map((location) => local(root, location.file)).sort()]);
    const occurrence = occurrences.get(fingerprint) ?? 0;
    occurrences.set(fingerprint, occurrence + 1);
    item.id = `${fingerprint}-${occurrence + 1}`;
    item.groupId = digest([item.tool, item.rule, item.classification, item.severity ?? null]);
    item.change ??= "uncompared";
    if (item.tool === "oxlint" && item.rule.startsWith("blindfolded")) item.guidance = { topic: "rules", rule: item.rule };
  }
  return identityVersion;
}

/** Load a saved report without executing project configuration or trusting its success flag. */
export function readReport(path) {
  const report = JSON.parse(readFileSync(path, "utf8"));
  if (!report || ![1, 2].includes(report.schemaVersion) || typeof report.root !== "string" || !Array.isArray(report.files)
    || !report.files.every((file) => typeof file === "string") || !Array.isArray(report.findings)
    || !report.findings.every((item) => item && typeof item.rule === "string" && typeof item.tool === "string" && typeof item.message === "string")
    || !Array.isArray(report.analyzers) || !report.analyzers.every((item) => item && typeof item.tool === "string" && typeof item.status === "string")
    || !Array.isArray(report.gaps)) throw new Error("Invalid saved analysis report.");
  identifyFindings(report.root, report.findings);
  report.success = report.findings.length === 0 && complete(report);
  return report;
}

function complete(report) {
  return report.gaps.length === 0 && ["oxlint", "typescript", "knip", "dependency-cruiser", "sonarjs", "fallow"].every((tool) => report.analyzers.some((item) => item.tool === tool && item.status === "completed"))
    && report.analyzers.every((item) => item.status === "completed");
}

/** Compare evidence without suppressing findings or changing analysis success. */
export function compareFindings(report, baseline, path) {
  identifyFindings(baseline.root, baseline.findings);
  const sameScope = JSON.stringify([...report.files].sort()) === JSON.stringify([...baseline.files].sort());
  const samePolicy = Boolean(report.configurationId && baseline.configurationId && report.policyVersion && baseline.policyVersion)
    && report.configurationId === baseline.configurationId && report.policyVersion === baseline.policyVersion;
  const comparable = sameScope && samePolicy && complete(baseline) && complete(report);
  const previous = new Set(baseline.findings.map((item) => item.id));
  for (const item of report.findings) item.change = previous.has(item.id) ? "existing" : comparable ? "introduced" : "uncompared";
  const current = new Set(report.findings.map((item) => item.id));
  report.comparison = { baseline: path, comparable, baselineComplete: complete(baseline), currentComplete: complete(report), sameScope, samePolicy,
    absentBaselineIds: baseline.findings.filter((item) => !current.has(item.id)).map((item) => item.id),
    limitations: ["Introduced means unmatched diagnostic evidence, not proof the selected change caused a defect.",
      "Absence is not proof of a fix. Incomplete or changed scope/policy leaves unmatched findings uncompared.",
      "Policy comparison covers recorded analyzer configuration, not all external configuration imports or dependency contents.",
      "IDs ignore checkout roots and line shifts; changed diagnostic text or insertion among identical occurrences can change IDs. Renames are not inferred."] };
  return report;
}

function counts(items, key) {
  const values = Object.create(null);
  for (const item of items) values[item[key] ?? "unspecified"] = (values[item[key] ?? "unspecified"] ?? 0) + 1;
  return values;
}

/** Summarize diagnostics while keeping all findings and source locations in the report. */
export function findingGroups(findings) {
  const groups = new Map();
  for (const item of findings) {
    let group = groups.get(item.groupId);
    if (!group) {
      group = { id: item.groupId, tool: item.tool, rule: item.rule, classification: item.classification, severity: item.severity ?? null,
        count: 0, changes: {}, ...(item.guidance ? { guidance: item.guidance } : {}) };
      groups.set(item.groupId, group);
    }
    group.count++;
    group.changes[item.change] = (group.changes[item.change] ?? 0) + 1;
  }
  return [...groups.values()];
}

/** Page evidence or groups with explicit omitted counts; retrieval does not record human review. */
export function reportPage(report, { offset = 0, limit = 50, view = "findings", groupId } = {}) {
  if (!Number.isInteger(offset) || offset < 0 || !Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("Report offset must be nonnegative and limit must be 1–100.");
  if (!["findings", "groups"].includes(view)) throw new Error("Report view must be findings or groups.");
  if (groupId && !report.findings.some((item) => item.groupId === groupId)) throw new Error("Unknown finding group.");
  if (groupId && view !== "findings") throw new Error("Group selection requires findings view.");
  const selected = groupId ? report.findings.filter((item) => item.groupId === groupId) : report.findings;
  const records = view === "groups" ? findingGroups(selected) : selected;
  const page = records.slice(offset, offset + limit);
  return { success: report.success, totalFindings: report.findings.length, totalRecords: records.length, view,
    summary: { classifications: counts(report.findings, "classification"), severities: counts(report.findings, "severity"), changes: counts(report.findings, "change"),
      analyzersComplete: report.analyzers.every((item) => item.status === "completed"), coverageComplete: report.gaps.length === 0, requiredChecksComplete: complete(report), coverageGapCount: report.gaps.length },
    ...(report.comparison ? { comparison: report.comparison } : {}),
    ...(groupId ? { groupId } : {}), [view]: page, offset, returnedCount: page.length, outsidePageCount: records.length - page.length,
    remainingAfterPage: Math.max(0, records.length - offset - page.length),
    nextOffset: offset + page.length < records.length ? offset + page.length : null, reviewStatus: "not-tracked" };
}
