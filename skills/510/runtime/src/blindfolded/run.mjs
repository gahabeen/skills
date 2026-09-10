import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { analyze } from "./analysis/suite.mjs";
import { storageFor, writablePath } from "../runtime/storage.mjs";

export async function runAnalysis(root, output, options = {}) {
  const storage = storageFor(root);
  const path = writablePath(output === undefined ? resolve(storage.reports, "report.json") : resolve(root, output));
  const report = await analyze(root, options);
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.${randomUUID()}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(report, null, 2)}\n`);
  renameSync(temporary, path);
  return { report, path };
}
