#!/usr/bin/env bun
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { spawn } from "node:child_process";
import { cases } from "../evals/510/cases.mjs";
import { prepareEvaluation, summarizeEvaluation, compareEvaluations } from "./evaluation-support.mjs";

const [command = "help", ...args] = process.argv.slice(2);
const { values, positionals } = parseArgs({ args, allowPositionals: true, options: { case: { type: "string" }, variant: { type: "string", default: "candidate" }, output: { type: "string" }, skill: { type: "string" }, runner: { type: "string" }, "runner-arg": { type: "string", multiple: true }, timeout: { type: "string", default: "600" } } });

async function runAdapter(request, executable, arguments_, timeout) {
  return new Promise((done, fail) => {
    const child = spawn(executable, arguments_, { cwd: request.project, stdio: ["pipe", "pipe", "pipe"], detached: process.platform !== "win32" });
    const started = performance.now();
    let stdout = "";
    let stderr = "";
    const stop = () => { try { if (process.platform !== "win32" && child.pid) process.kill(-child.pid, "SIGKILL"); else child.kill("SIGKILL"); } catch (error) { if (error.code !== "ESRCH") fail(error); } };
    const timer = setTimeout(() => { stop(); fail(new Error("Evaluation runner timed out; partial fixture remains available.")); }, timeout);
    child.on("error", (error) => { clearTimeout(timer); fail(error); });
    child.stdout.on("data", (data) => { stdout += data; if (stdout.length > 8 * 1024 * 1024) { stop(); fail(new Error("Runner output exceeded 8 MiB.")); } });
    child.stderr.on("data", (data) => { stderr = (stderr + data).slice(-8000); });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) { fail(new Error(`Runner failed (${code}): ${stderr}`)); return; }
      try { done({ ...JSON.parse(stdout), caseId: request.caseId, variant: request.variant, durationMs: Math.round(performance.now() - started) }); }
      catch (error) { fail(error); }
    });
    child.stdin.on("error", () => {});
    child.stdin.end(JSON.stringify(request));
  });
}

try {
  if (command === "help") console.log("510 evaluations\n  list\n  prepare --case ID --variant baseline|candidate|none --output NEW_DIRECTORY [--skill SKILL_DIRECTORY]\n  run --case ID --output NEW_DIRECTORY [--skill SKILL_DIRECTORY] --runner PROGRAM [--runner-arg ARG] [--timeout SECONDS]\n  summarize RECORD.json ... [--output REPORT.json]\nRunner receives request JSON on stdin and returns one evaluation record on stdout. No model or network is selected automatically.");
  else if (command === "list") console.log(JSON.stringify(cases.map(({ id, prompt, checks }) => ({ id, prompt, checks })), null, 2));
  else if (["prepare", "run"].includes(command)) {
    if (!values.case || !values.output) throw new Error("--case and a fresh --output directory are required.");
    const timeout = Number(values.timeout) * 1000;
    if (!Number.isFinite(timeout) || timeout < 100 || timeout > 3_600_000) throw new Error("Timeout must be 0.1–3600 seconds.");
    if (command === "run" && !values.runner) throw new Error("--runner is required; no agent is invoked by default.");
    const request = prepareEvaluation({ caseId: values.case, variant: values.variant, directory: values.output, skill: values.skill });
    if (command === "prepare") console.log(JSON.stringify(request, null, 2));
    else {
      const record = await runAdapter(request, values.runner, values["runner-arg"] ?? [], timeout);
      writeFileSync(resolve(values.output, "result.json"), JSON.stringify(record, null, 2) + "\n");
      const summary = summarizeEvaluation(record);
      writeFileSync(resolve(values.output, "summary.json"), JSON.stringify(summary, null, 2) + "\n");
      console.log(JSON.stringify(summary, null, 2));
      process.exitCode = summary.qualityPassed ? 0 : 1;
    }
  } else if (command === "summarize") {
    if (!positionals.length) throw new Error("Supply at least one evaluation record.");
    const runs = positionals.map((path) => summarizeEvaluation(JSON.parse(readFileSync(path, "utf8"))));
    const report = { runs, comparisons: compareEvaluations(runs) };
    const json = JSON.stringify(report, null, 2) + "\n";
    if (values.output) writeFileSync(resolve(values.output), json);
    else console.log(json);
    process.exitCode = report.runs.every((run) => run.qualityPassed) ? 0 : 1;
  } else throw new Error(`Unknown evaluation command: ${command}`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
