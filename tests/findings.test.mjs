import { expect, test } from "bun:test";
import { finalize } from "../src/blindfolded/analysis/report.mjs";
import { compareFindings, configurationIdentity, reportPage } from "../src/blindfolded/analysis/findings.mjs";

function report(root, diagnostics, gaps = []) {
  const tools = ["oxlint", "typescript", "knip", "dependency-cruiser", "sonarjs", "fallow"];
  return finalize({ root, files: ["src/index.ts"], scope: { paths: ["src"] }, thresholds: {} }, tools.map((tool) => ({ tool, status: "completed", gaps: tool === "oxlint" ? gaps : [], findings: tool === "oxlint" ? diagnostics.map(([message, line]) => ({ tool, rule: "blindfolded(no-runtime-typeof)", classification: "Enforce", severity: "error", file: "src/index.ts", line, message })) : [] })));
}

test("finding IDs survive checkout relocation and line shifts, without collapsing repeated locations", () => {
  const previous = report("/old", [["redundant check", 2], ["redundant check", 8]]);
  const next = report("/new", [["redundant check", 12], ["redundant check", 18], ["new check", 20]]);
  expect(next.findings[0].id).toBe(previous.findings[0].id);
  expect(next.findings[0].id).not.toBe(next.findings[1].id);
  compareFindings(next, previous, "prior.json");
  expect(next.findings.map((item) => item.change)).toEqual(["existing", "existing", "introduced"]);
  expect(next.success).toBe(false);
  expect(next.findings[0].guidance).toEqual({ topic: "rules", rule: "blindfolded(no-runtime-typeof)" });
});

test("incomplete baselines cannot imply introduced findings or turn a failure green", () => {
  const previous = report("/repo", [["existing", 2]], ["missing coverage"]);
  const next = report("/repo", [["existing", 2], ["unmatched", 3]]);
  compareFindings(next, previous, "incomplete.json");
  expect(next.comparison.comparable).toBe(false);
  expect(next.findings.map((item) => item.change)).toEqual(["existing", "uncompared"]);
  expect(next.success).toBe(false);
});

test("comparison detects recorded policy changes while ignoring relocatable configuration paths", () => {
  const config = (root, directory, strict) => configurationIdentity({ root, thresholds: {} }, [{ tool: "typescript", configuration: { strict, base: `${root}/tsconfig.json`, generated: `${directory}/tsconfig.json` } }], directory);
  expect(config("/old", "/tmp/one", true)).toBe(config("/new", "/tmp/two", true));
  expect(config("/old", "/tmp/one", true)).not.toBe(config("/old", "/tmp/one", false));
  const previous = report("/repo", []);
  const next = report("/repo", [["new under changed policy", 2]]);
  next.configurationId = "changed-policy";
  compareFindings(next, previous, "previous.json");
  expect(next.comparison.samePolicy).toBe(false);
  expect(next.findings[0].change).toBe("uncompared");
  delete previous.configurationId;
  compareFindings(next, previous, "legacy.json");
  expect(next.comparison.comparable).toBe(false);
});

test("group pages preserve counts and provide complete drill-down with explicit remaining evidence", () => {
  const data = report("/repo", [["a", 1], ["b", 2], ["c", 3]]);
  const groups = reportPage(data, { view: "groups", limit: 1 });
  expect(groups.groups[0].count).toBe(3);
  expect(groups.totalFindings).toBe(3);
  expect(groups.reviewStatus).toBe("not-tracked");
  const first = reportPage(data, { groupId: groups.groups[0].id, limit: 2 });
  const last = reportPage(data, { groupId: groups.groups[0].id, offset: first.nextOffset, limit: 2 });
  expect(first.remainingAfterPage).toBe(1);
  expect(last.nextOffset).toBeNull();
  expect([...first.findings, ...last.findings].map((item) => item.line)).toEqual([1, 2, 3]);
  expect(last.success).toBe(false);
  expect(() => reportPage(data, { groupId: "missing" })).toThrow();
  expect(() => reportPage(data, { offset: -1 })).toThrow();
});
