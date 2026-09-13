import { afterEach, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { prepareEvaluation, summarizeEvaluation } from "../scripts/evaluation-support.mjs";
import { cases } from "../evals/510/cases.mjs";

const directories = [];
afterEach(() => { for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true }); });
function folder() { const directory = mkdtempSync(resolve(tmpdir(), "510-evaluation-test-")); directories.push(directory); return directory; }

test("evaluation prepares isolated work and preserves pre-existing staged changes in the commit scenario", () => {
  const directory = resolve(folder(), "run");
  const request = prepareEvaluation({ caseId: "commit-selection", variant: "candidate", directory });
  const result = spawnSync("git", ["status", "--porcelain"], { cwd: request.project, encoding: "utf8" });
  expect(result.status).toBe(0);
  expect(result.stdout).toContain(" M invoice.ts");
  expect(result.stdout).toContain("A  unrelated.txt");
  expect(() => prepareEvaluation({ caseId: "explain", variant: "candidate", directory })).toThrow("already exists");
});

test("evaluation retains missing telemetry, counts repeated reads, and fails missing quality evidence", () => {
  const directory = folder();
  const file = resolve(directory, "source.ts");
  writeFileSync(file, "one two three\n");
  const record = { caseId: "explain", variant: "candidate", reads: [file, file], toolCalls: ["read", "read"], durationMs: 12, inputTokens: null, outputTokens: null, qualityChecks: [] };
  const incomplete = summarizeEvaluation(record);
  expect(incomplete.loadedWords).toBe(6);
  expect(incomplete.inputTokens).toBeNull();
  expect(incomplete.qualityPassed).toBe(false);
  record.qualityChecks = cases.find((item) => item.id === "explain").checks.map((name) => ({ name, passed: true, evidence: "Inspected execution trace and answer." }));
  expect(summarizeEvaluation(record).qualityPassed).toBe(true);
  record.inputTokens = -1;
  expect(() => summarizeEvaluation(record)).toThrow("inputTokens");
});

test("runner protocol captures an actual child response and measured duration without inventing a model", () => {
  const directory = folder();
  const adapter = resolve(directory, "adapter.mjs");
  writeFileSync(adapter, `const request = JSON.parse(await Bun.stdin.text()); console.log(JSON.stringify({ caseId: request.caseId, variant: request.variant, reads: [], toolCalls: [], qualityChecks: [], model: null, inputTokens: null, outputTokens: null }));`);
  const out = resolve(directory, "run");
  const result = spawnSync(process.execPath, [resolve(import.meta.dir, "../scripts/evaluate-510.mjs"), "run", "--case", "bare", "--output", out, "--runner", process.execPath, "--runner-arg", adapter], { encoding: "utf8" });
  expect(result.status).toBe(1);
  const summary = JSON.parse(readFileSync(resolve(out, "summary.json"), "utf8"));
  expect(summary.durationMs).toBeGreaterThanOrEqual(0);
  expect(summary.model).toBeNull();
  expect(summary.qualityPassed).toBe(false);
});
