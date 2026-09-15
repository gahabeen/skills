import { spawn } from "node:child_process";
import { closeSync, fstatSync, mkdirSync, mkdtempSync, openSync, readFileSync, readSync, rmSync } from "node:fs";
import { resolve } from "node:path";

import { packagePath } from "../../runtime/packages.mjs";
import { storageFor } from "../../runtime/storage.mjs";
export { requireTool, resolveTool, manifest, packagePath, loadTool } from "../../runtime/packages.mjs";
export function bin(name, command, root) {
  const directory = packagePath(name, root);
  const metadata = JSON.parse(readFileSync(resolve(directory, "package.json"), "utf8"));
  return resolve(directory, typeof metadata.bin === "string" ? metadata.bin : metadata.bin[command]);
}

// Read a bounded tail even when a failed process exceeded its output allowance.
function tail(fd) {
  const size = fstatSync(fd).size;
  const buffer = Buffer.alloc(Math.min(size, 4000));
  readSync(fd, buffer, 0, buffer.length, size - buffer.length);
  return buffer.toString("utf8");
}

// File descriptors avoid truncated native CLI writes to Bun pipes. Poll file
// sizes while running, then check again before reading either result into memory.
async function capture(command, args, root, environment, descriptors, options) {
  const { signal, timeout = 120_000, maxBuffer = 32 * 1024 * 1024 } = options;
  if (signal?.aborted) throw new Error("Analysis cancelled.");
  const child = spawn(process.execPath, ["--no-install", command, ...args], {
    cwd: root, stdio: ["ignore", ...descriptors], detached: process.platform !== "win32",
    env: { ...process.env, NO_COLOR: "1", CI: "true", ...environment },
  });
  let failure;
  let interrupted;
  function kill() {
    try {
      if (process.platform !== "win32" && child.pid) process.kill(-child.pid, "SIGKILL");
      else child.kill("SIGKILL");
    } catch (error) { if (error.code !== "ESRCH") failure ??= error.message; }
  }
  function stop(message) {
    failure ??= message;
    kill();
  }
  function checkSize() {
    for (const [index, fd] of descriptors.entries()) {
      if (fstatSync(fd).size > maxBuffer) stop(`Analyzer ${index === 0 ? "stdout" : "stderr"} exceeded ${maxBuffer} bytes.`);
    }
  }
  const abort = () => stop("Analysis cancelled.");
  const terminate = () => { interrupted = "SIGTERM"; abort(); };
  const interrupt = () => { interrupted = "SIGINT"; abort(); };
  process.once("SIGTERM", terminate);
  process.once("SIGINT", interrupt);
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) abort();
  const timer = setTimeout(() => stop(`Analyzer exceeded the ${timeout} ms time limit.`), timeout);
  const monitor = setInterval(checkSize, 10);
  try {
    const result = await new Promise((done) => {
      child.on("error", error => { failure ??= error.message; });
      child.on("close", (status, exitSignal) => done({ status, signal: exitSignal }));
    });
    kill();
    checkSize();
    if (failure || result.signal) throw Object.assign(new Error(`Analyzer did not complete: ${failure ?? result.signal}\nstderr tail: ${tail(descriptors[1])}`), { interrupted });
    return result.status;
  } finally {
    clearTimeout(timer);
    clearInterval(monitor);
    signal?.removeEventListener("abort", abort);
    process.removeListener("SIGTERM", terminate);
    process.removeListener("SIGINT", interrupt);
  }
}

/** Run a pinned analyzer with bounded file capture and process-tree cancellation. */
export async function run(command, args, root, environment = {}, options = {}) {
  const temporary = storageFor(root).temporary;
  mkdirSync(temporary, { recursive: true });
  const directory = mkdtempSync(resolve(temporary, "capture-"));
  const descriptors = [];
  let interrupted;
  try {
    const paths = [resolve(directory, "stdout"), resolve(directory, "stderr")];
    for (const path of paths) descriptors.push(openSync(path, "w+", 0o600));
    const status = await capture(command, args, root, environment, descriptors, options);
    return { status, stdout: readFileSync(paths[0], "utf8"), stderr: readFileSync(paths[1], "utf8") };
  } catch (error) {
    interrupted = error.interrupted;
    throw error;
  } finally {
    for (const fd of descriptors) closeSync(fd);
    rmSync(directory, { recursive: true, force: true });
    // Preserve external signal termination after releasing files and children.
    if (interrupted) process.kill(process.pid, interrupted);
  }
}
/** Parse a result envelope, retaining both streams' size and tail on failure. */
export function parseOutput(result, label) {
  try { return JSON.parse(result.stdout); }
  catch { throw new Error(`${label} did not return valid results (exit ${result.status}): stdout ${Buffer.byteLength(result.stdout)} bytes, stderr ${Buffer.byteLength(result.stderr)} bytes\nstdout head: ${result.stdout.slice(0, 2000)}\nstdout tail: ${result.stdout.slice(-2000)}\nstderr tail: ${result.stderr.slice(-4000)}`); }
}
export function finding(tool, rule, file, message, classification, details = {}) {
  return { tool, rule, file, line: null, column: null, message, classification,
    evidence: message, uncertainty: null, action: classification === "Review"
      ? "Inspect the source and its context before choosing a change."
      : "Resolve the reported contract or policy violation without suppressing the check.", ...details };
}
export function completed(findings = [], extra = {}) { return { status: "completed", findings, gaps: [], ...extra }; }
