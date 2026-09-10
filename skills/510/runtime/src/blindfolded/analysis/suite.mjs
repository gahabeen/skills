import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readProject } from "./project.mjs";
import { prepareProjects } from "./projects.mjs";
import { finalize } from "./report.mjs";
import { copyRules } from "../install.mjs";
import { storageFor } from "../../runtime/storage.mjs";

const analyzers = ["oxlint", "typescript", "knip", "dependency-cruiser", "sonarjs"];
const worker = fileURLToPath(new URL("worker.mjs", import.meta.url));
function execute(tool, context, signal, root) {
  return new Promise((done) => {
    if (signal?.aborted) { done({ tool, status: "incomplete", findings: [], gaps: ["Analysis cancelled."] }); return; }
    const child = spawn(process.execPath, ["--no-install", worker, tool, context], { cwd: root, stdio: ["ignore", "pipe", "pipe"], detached: process.platform !== "win32" });
    let stdout = "";
    let stderr = "";
    let failure;
    let killTimer;
    function kill(signalName) {
      try {
        if (process.platform !== "win32" && child.pid) process.kill(-child.pid, signalName);
        else child.kill(signalName);
      } catch (error) { if (error.code !== "ESRCH") failure ??= error.message; }
    }
    function stop(message) {
      if (failure) return;
      failure = message;
      kill("SIGTERM");
      killTimer = setTimeout(() => kill("SIGKILL"), 1000);
    }
    const abort = () => stop("Analysis cancelled.");
    signal?.addEventListener("abort", abort, { once: true });
    const timer = setTimeout(() => stop("Analyzer exceeded the five-minute time limit."), 300_000);
    child.stdout.on("data", (data) => { stdout += data; if (stdout.length > 32 * 1024 * 1024) stop("Analyzer output exceeded 32 MiB."); });
    child.stderr.on("data", (data) => { stderr = (stderr + data).slice(-8000); });
    child.on("error", (error) => { failure = error.message; });
    child.on("close", (code, exitSignal) => {
      clearTimeout(timer);
      clearTimeout(killTimer);
      signal?.removeEventListener("abort", abort);
      try {
        if (failure || code !== 0) throw new Error(failure ?? `${tool} exited ${code ?? exitSignal}: ${stderr}`);
        const result = JSON.parse(stdout);
        if (!Array.isArray(result.findings) || !Array.isArray(result.gaps)) throw new Error("Invalid analyzer report.");
        done(result);
      } catch (error) { done({ tool, status: "incomplete", findings: [], gaps: [`${error.message}${stderr ? `\n${stderr}` : ""}`] }); }
    });
  });
}

export async function analyze(root, { signal, paths } = {}) {
  let project;
  try { project = readProject(resolve(root), paths); }
  catch (error) {
    return finalize({ root: resolve(root), files: [], scope: paths === undefined ? {} : { paths, pathSource: "request" }, thresholds: {} },
      analyzers.map((tool) => ({ tool, status: "incomplete", findings: [], gaps: [error.message] })));
  }
  const storage = storageFor(root);
  mkdirSync(storage.temporary, { recursive: true });
  const directory = mkdtempSync(resolve(storage.temporary, "analysis-"));
  try {
    const modules = resolve(storage.toolchain, "node_modules");
    if (existsSync(modules)) symlinkSync(modules, resolve(directory, "node_modules"), process.platform === "win32" ? "junction" : "dir");
    copyRules(resolve(directory, "rules"));
    let prepared;
    try { prepared = prepareProjects(project, directory); }
    catch (error) { prepared = { configs: [], gaps: [error.message] }; }
    const context = resolve(directory, "context.json");
    writeFileSync(context, JSON.stringify({ project, directory, prepared }));
    const results = await Promise.all(analyzers.map((tool) => execute(tool, context, signal, project.root)));
    if (project.unsupported.length) results.push({ tool: "source-coverage", status: "incomplete", findings: [],
      gaps: project.unsupported.map((file) => `Embedded source needs a supported parser: ${file}`) });
    return finalize(project, results);
  } finally { rmSync(directory, { recursive: true, force: true }); }
}
