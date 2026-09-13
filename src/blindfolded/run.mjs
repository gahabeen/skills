import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { analyze } from "./analysis/suite.mjs";
import { storageFor, writablePath } from "../runtime/storage.mjs";
import { compareFindings, readReport } from "./analysis/findings.mjs";

export async function runAnalysis(root, output, options = {}) {
  const storage = storageFor(root);
  const path = writablePath(output === undefined ? resolve(storage.reports, "report.json") : resolve(root, output));
  const baselinePath = options.baseline === undefined ? undefined : resolve(root, options.baseline);
  // Read the snapshot before analysis can replace the default report path.
  const baseline = baselinePath === undefined ? undefined : readReport(baselinePath);
  const report = await analyze(root, options);
  if (baseline) compareFindings(report, baseline, baselinePath);
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.${randomUUID()}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(report, null, 2)}\n`);
  renameSync(temporary, path);
  return { report, path };
}
