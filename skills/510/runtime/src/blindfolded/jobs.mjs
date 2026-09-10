import { randomUUID } from "node:crypto";
import { runAnalysis } from "./run.mjs";
import { resolve } from "node:path";
import { storageFor } from "../runtime/storage.mjs";
import { sourcePaths } from "./analysis/project.mjs";

export class AnalysisJobs {
  #root;
  #jobs = new Map();
  #active;

  constructor(root) { this.#root = root; }

  start(paths) {
    if (paths !== undefined) paths = sourcePaths(this.#root, paths);
    if (this.#active) {
      const active = this.#jobs.get(this.#active);
      if (JSON.stringify(active.paths) !== JSON.stringify(paths)) throw new Error("An analysis with a different scope is running. Wait for it to finish before starting this scope.");
      return { id: this.#active, status: "running", paths };
    }
    const id = randomUUID();
    const controller = new AbortController();
    const job = { id, status: "running", paths, startedAt: new Date().toISOString(), controller };
    this.#jobs.set(id, job);
    this.#active = id;
    if (this.#jobs.size > 10) this.#jobs.delete(this.#jobs.keys().next().value);
    job.promise = runAnalysis(this.#root, resolve(storageFor(this.#root).reports, "runs", `${id}.json`), { signal: controller.signal, paths }).then(({ report, path }) => {
      Object.assign(job, { status: "completed", report, path });
    }, (error) => { Object.assign(job, { status: "failed", error: error.message }); }).finally(() => {
      job.finishedAt = new Date().toISOString();
      this.#active = undefined;
    });
    return { id, status: "running", paths };
  }

  result(id, offset = 0, limit = 50) {
    const job = this.#jobs.get(id);
    if (!job) throw new Error("Unknown or expired analysis id. Saved reports remain in the configured reports directory.");
    const { report, promise: _promise, controller: _controller, ...metadata } = job;
    if (!report) return metadata;
    return { ...metadata, success: report.success, root: report.root, scope: report.scope,
      gaps: report.gaps, totalFindings: report.findings.length, selectedFileCount: report.files.length,
      analyzers: report.analyzers.map(({ tool, status }) => ({ tool, status })),
      findings: report.findings.slice(offset, offset + limit),
      nextOffset: offset + limit < report.findings.length ? offset + limit : null };
  }

  async close() {
    for (const job of this.#jobs.values()) if (job.status === "running") job.controller.abort();
    await Promise.all([...this.#jobs.values()].map((job) => job.promise));
  }
}
