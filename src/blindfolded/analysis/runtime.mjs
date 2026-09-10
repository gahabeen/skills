import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { packagePath } from "../../runtime/packages.mjs";
export { requireTool, resolveTool, manifest, packagePath, loadTool } from "../../runtime/packages.mjs";
export function bin(name, command, root) {
  const directory = packagePath(name, root);
  const metadata = JSON.parse(readFileSync(resolve(directory, "package.json"), "utf8"));
  return resolve(directory, typeof metadata.bin === "string" ? metadata.bin : metadata.bin[command]);
}
export function run(command, args, root, environment = {}) {
  const result = spawnSync(process.execPath, ["--no-install", command, ...args], {
    cwd: root, encoding: "utf8", timeout: 120_000, maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, NO_COLOR: "1", CI: "true", ...environment },
  });
  if (result.error || result.signal) throw new Error(`Analyzer did not complete: ${result.error?.message ?? result.signal}`);
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}
export function parseOutput(result, label) {
  try { return JSON.parse(result.stdout); }
  catch { throw new Error(`${label} did not return valid results (exit ${result.status}): ${(result.stderr || result.stdout).slice(0, 4000)}`); }
}
export function finding(tool, rule, file, message, classification, details = {}) {
  return { tool, rule, file, line: null, column: null, message, classification,
    evidence: message, uncertainty: null, action: classification === "Review"
      ? "Inspect the source and its context before choosing a change."
      : "Resolve the reported contract or policy violation without suppressing the check.", ...details };
}
export function completed(findings = [], extra = {}) { return { status: "completed", findings, gaps: [], ...extra }; }
