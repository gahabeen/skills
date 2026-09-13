import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cases } from "../evals/510/cases.mjs";

const words = (text) => text.trim() ? text.trim().split(/\s+/).length : 0;

function writeFixture(root, files) {
  for (const [path, content] of Object.entries(files)) {
    const target = resolve(root, path);
    const local = relative(root, target);
    if (isAbsolute(path) || local === ".." || local.startsWith("../")) throw new Error("Fixture path leaves its workspace.");
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
}

function git(root, args) {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8", env: { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" } });
  if (result.status !== 0) throw new Error(result.stderr || "Fixture Git setup failed.");
}

/** Create an isolated scenario and optional skill snapshot; refuse to overwrite an existing run. */
export function prepareEvaluation({ caseId, variant, directory, skill }) {
  const scenario = cases.find((item) => item.id === caseId);
  if (!scenario) throw new Error(`Unknown scenario: ${caseId}`);
  if (variant === "none" && (skill || caseId === "bare")) throw new Error("The no-skill control requires no skill and a substantive task.");
  directory = resolve(directory);
  if (existsSync(directory)) throw new Error("Evaluation directory already exists; choose a fresh run.");
  const project = resolve(directory, "project");
  mkdirSync(project, { recursive: true });
  writeFixture(project, scenario.files);
  if (scenario.git) {
    git(project, ["init", "--quiet"]);
    git(project, ["add", "."]);
    git(project, ["-c", "user.name=510 Evaluation", "-c", "user.email=eval@example.invalid", "-c", "commit.gpgsign=false", "commit", "--quiet", "-m", "Fixture baseline"]);
    writeFixture(project, scenario.edits);
    git(project, ["add", ...scenario.staged]);
  }
  const skillPath = skill ? resolve(directory, "skill") : null;
  if (skill) cpSync(resolve(skill), skillPath, { recursive: true, filter: (path) => !path.includes("/node_modules") });
  const request = { caseId, variant, project, skill: skillPath, prompt: variant === "none" ? scenario.prompt.replace(/^\$510\s+/, "") : scenario.prompt };
  writeFileSync(resolve(directory, "request.json"), JSON.stringify(request, null, 2) + "\n");
  writeFileSync(resolve(directory, "rubric.json"), JSON.stringify({ checks: scenario.checks }, null, 2) + "\n");
  return request;
}

/** Compare repeated runs for the same case, exposing sample size and model uncertainty. */
export function compareEvaluations(runs) {
  const groups = new Map();
  for (const run of runs) {
    const group = groups.get(run.caseId) ?? [];
    group.push(run);
    groups.set(run.caseId, group);
  }
  return [...groups].map(([caseId, group]) => {
    const variants = [...new Set(group.map((run) => run.variant))].map((variant) => {
      const sample = group.filter((run) => run.variant === variant);
      const mean = (key) => sample.every((run) => run[key] !== null) ? sample.reduce((sum, run) => sum + run[key], 0) / sample.length : null;
      return { variant, samples: sample.length, qualityPasses: sample.filter((run) => run.qualityPassed).length,
        meanLoadedWords: mean("loadedWords"), meanDurationMs: mean("durationMs"), meanInputTokens: mean("inputTokens"), meanOutputTokens: mean("outputTokens") };
    });
    const baseline = variants.find((variant) => variant.variant === "baseline");
    const candidate = variants.find((variant) => variant.variant === "candidate");
    const sameKnownModel = group.every((run) => run.model !== null) && new Set(group.map((run) => run.model)).size === 1;
    return { caseId, sameKnownModel, variants, ...(baseline && candidate ? { loadedWordDelta: candidate.meanLoadedWords - baseline.meanLoadedWords } : {}),
      limitations: "Reported read-volume difference is descriptive. Quality and speed claims require repeated, comparable runs and independently verified outcomes." };
  });
}

/** Validate measured records; absent telemetry or rubric evidence remains unknown, never zero/passing. */
export function summarizeEvaluation(record) {
  const scenario = cases.find((item) => item.id === record.caseId);
  if (!scenario || typeof record.variant !== "string" || !Array.isArray(record.reads) || !Array.isArray(record.toolCalls) || !Array.isArray(record.qualityChecks)) throw new Error("Invalid evaluation record.");
  for (const key of ["durationMs", "inputTokens", "outputTokens"]) {
    if (record[key] !== null && (!Number.isFinite(record[key]) || record[key] < 0)) throw new Error(`Missing or invalid ${key}; use null when unavailable.`);
  }
  const reads = record.reads.map((path) => {
    if (typeof path !== "string" || !isAbsolute(path)) throw new Error("Read evidence requires absolute file paths.");
    const content = readFileSync(path, "utf8");
    return { path, words: words(content), bytes: Buffer.byteLength(content), sha256: createHash("sha256").update(content).digest("hex") };
  });
  const checks = scenario.checks.map((name) => {
    const results = record.qualityChecks.filter((check) => check.name === name);
    const result = results[0];
    const valid = results.length === 1 && typeof result.passed === "boolean" && typeof result.evidence === "string" && result.evidence.trim();
    return { name, status: valid ? result.passed ? "passed" : "failed" : "unverified", evidence: valid ? result.evidence : "No unique evidence-backed assessment supplied." };
  });
  return { caseId: record.caseId, variant: record.variant, model: record.model ?? null, checks,
    qualityPassed: checks.every((check) => check.status === "passed"), reads,
    fileReadCount: reads.length, loadedWords: reads.reduce((total, read) => total + read.words, 0), toolCallCount: record.toolCalls.length,
    durationMs: record.durationMs, inputTokens: record.inputTokens, outputTokens: record.outputTokens,
    limitations: ["Word counts cover reported full-file reads, not actual model tokens or partial tool responses. Repeated reads count again.",
      "Quality evidence is evaluator-supplied; independently verify artifacts and traces. Unknown telemetry is not zero.",
      "A single run is a smoke evaluation, not a reliable quality or latency benchmark. Compare repeated cases using the same model and constraints."] };
}
