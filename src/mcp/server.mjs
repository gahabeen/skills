import { realpathSync, statSync } from "node:fs";
import { AnalysisJobs } from "../blindfolded/jobs.mjs";
import { RepositorySearch } from "../search/fff.mjs";
import { doctor } from "../runtime/doctor.mjs";
import { readGuide, topics } from "../runtime/guides.mjs";
import { loadTool, manifest } from "../runtime/packages.mjs";
import { workflowPaths } from "../runtime/storage.mjs";

function result(value) {
  return { content: [{ type: "text", text: JSON.stringify(value) }], structuredContent: value };
}

export async function serve(root) {
  root = realpathSync(root);
  if (!statSync(root).isDirectory()) throw new Error("MCP root must be a directory.");
  const [{ McpServer }, { StdioServerTransport }, { z }] = await Promise.all([
    loadTool("@modelcontextprotocol/sdk/server/mcp.js", root), loadTool("@modelcontextprotocol/sdk/server/stdio.js", root), loadTool("zod", root),
  ]);
  const server = new McpServer({ name: "510", version: manifest.version });
  const search = new RepositorySearch(root);
  const jobs = new AnalysisJobs(root);
  function tool(name, description, shape, readOnlyHint, operation) {
    server.registerTool(name, { description, inputSchema: z.object(shape).strict(),
      annotations: { readOnlyHint, destructiveHint: false, openWorldHint: false } },
    async (args) => result(await operation(args)));
  }
  tool("doctor", "Check 510 storage, pinned packages, and FFF native loading. Does not install anything.", {}, true, () => doctor(root));
  tool("paths", "Resolve configured exploration, spec, and debug directories for this project. Read-only: does not create directories, install dependencies, or change storage settings.", {}, true, () => workflowPaths(root));
  tool("guide", "Read a 510 workflow or supporting guide: explain, explore, output style, writing for agents, DOX AGENTS.md maintenance, commit, PR creation, merge conflicts, handoff, grill, spec, implement, TDD, debug, design, architecture improvement, review, refactoring, or storage/toolchain guidance. Returns instructions; the agent performs the workflow.", { topic: z.enum(topics) }, true, ({ topic }) => readGuide(topic));
  tool("find_files", "Find repository files with FFF. Use short filename/path queries; page through results. Root is fixed when the server starts.", {
    query: z.string().min(1).max(2000), page: z.number().int().min(0).default(0), limit: z.number().int().min(1).max(100).default(20),
  }, true, ({ query, page, limit }) => search.findFiles(query, page, limit));
  tool("search", "Search repository contents with FFF using one or more literal patterns (OR). Prefer bare identifiers. Constraints accept *.ts, src/, !test/. Reuse the returned cursor with unchanged arguments.", {
    patterns: z.array(z.string().min(1).max(2000)).min(1).max(20), constraints: z.string().max(2000).default(""),
    cursor: z.string().uuid().optional(), limit: z.number().int().min(1).max(100).default(50), context: z.number().int().min(0).max(5).default(2),
  }, true, ({ patterns, ...options }) => search.search(patterns, options));
  tool("analyze", "Start the complete static suite. Optional paths select files/directories for this run, relative to the fixed repository root or absolute within it; saved settings and storage are preserved. Omitted paths use saved/default discovery; pass paths: ['.'] for a whole-repository review. Imports and discovered tooling entries may supply additional context. All findings and incomplete required checks block success. No tests, builds, or application startup; tooling configuration may execute. Returns a job id. Writes to the configured reports directory, default .fiveten/reports/runs/.",
    { paths: z.array(z.string().min(1)).min(1).optional() }, false, ({ paths }) => jobs.start(paths));
  tool("analysis_result", "Read analysis status and a page of findings. Poll running jobs with a delay. Review all pages and coverage gaps; full evidence is saved at the returned report path.", {
    id: z.string().uuid(), offset: z.number().int().min(0).default(0), limit: z.number().int().min(1).max(100).default(50),
  }, true, ({ id, offset, limit }) => jobs.result(id, offset, limit));
  for (const topic of topics) {
    server.registerResource(topic, `five-ten://guides/${topic}`, { mimeType: "text/markdown" }, async (uri) => ({
      contents: [{ uri: uri.href, mimeType: "text/markdown", text: readGuide(topic).markdown }],
    }));
  }
  let closing;
  function close() {
    if (!closing) closing = (async () => { search.close(); await jobs.close(); await server.close(); })();
    return closing;
  }
  server.server.onclose = close;
  process.once("SIGTERM", () => { void close(); });
  process.once("SIGINT", () => { void close(); });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stdin.once("end", () => { void close(); });
  return { server, close };
}
