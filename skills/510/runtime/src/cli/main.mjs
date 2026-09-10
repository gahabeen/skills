#!/usr/bin/env bun
import { realpathSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { render } from "../blindfolded/analysis/report.mjs";
import { sourcePaths } from "../blindfolded/analysis/project.mjs";
import { runAnalysis } from "../blindfolded/run.mjs";
import { copyRules } from "../blindfolded/install.mjs";
import { checkBun, doctor } from "../runtime/doctor.mjs";
import { setup } from "../runtime/setup.mjs";
import { readGuide } from "../runtime/guides.mjs";
import { connectionConfig } from "../runtime/connection.mjs";
import { projectRoot as locateProject, workflowPaths } from "../runtime/storage.mjs";

const [command = "help", ...args] = process.argv.slice(2);
const rootOption = { root: { type: "string" } };
function options(definition = {}, allowPositionals = false) {
  return parseArgs({ args, options: definition, allowPositionals });
}
function json(value) { console.log(JSON.stringify(value, null, 2)); }
function projectRoot(values) {
  if (!values.root) throw new Error(`${command} requires --root /path/to/project.`);
  const root = realpathSync(values.root);
  if (!statSync(root).isDirectory()) throw new Error("Project root must be a directory.");
  return root;
}

const commands = {
  help() {
    console.log(`510 — agent workflows and local code analysis\n
  init [--root PATH]             Prepare storage/toolchain and return AGENTS.md guidance
        [--storage project|shared|PATH]
  doctor [--root PATH]           Check storage, packages, and native search
  paths [--root PATH]            Print configured spec and debug paths without initialization
  analyze [--root PATH]          Run every static analyzer
          [--path PATH ...]     Select source files/directories for this run
          [--format text|json] [--output PATH]
  serve --root PATH             Start the local MCP server over stdio
  mcp-config --root PATH        Print a connection using absolute paths
  commit                        Print the agent current-thread commit workflow
  pr [--base BRANCH]             Print the agent pull-request workflow and requested base
  handoff                       Print the agent handoff workflow
  grill                         Print the agent grilling-with-docs workflow
  spec                          Print the agent specification workflow
  implement                     Print the agent spec-to-implementation workflow
  debug                         Print the agent bug-diagnosis workflow
  review [PATH ...] [--root PATH] Print the agent code-review workflow with its scope
  refactor                      Print the agent refactoring workflow
  guide TOPIC                   Read a workflow or supporting guide
  install-rules [DESTINATION]    Copy editable Blindfolded Oxlint rules

Run with bun <skill-directory>/scripts/510.mjs <command>.
Commit, pr, handoff, grill, spec, implement, debug, review, and refactor print guidance; the agent performs the workflow.
Init returns the documentation guide for the agent to establish the AGENTS.md hierarchy.
Initialization and connection are separate. No command changes agent configuration.`);
  },
  async init() {
    const { values } = options({ ...rootOption, storage: { type: "string" } });
    const status = await setup(locateProject(values.root), values.storage);
    json(status); process.exitCode = status.ready ? 0 : 1;
  },
  async doctor() {
    const { values } = options(rootOption);
    const status = await doctor(locateProject(values.root));
    json(status); process.exitCode = status.ready ? 0 : 1;
  },
  paths() {
    const { values } = options(rootOption);
    json(workflowPaths(locateProject(values.root)));
  },
  async analyze() {
    const { values } = options({ ...rootOption, path: { type: "string", multiple: true }, format: { type: "string", default: "text" }, output: { type: "string" } });
    if (!["text", "json"].includes(values.format)) throw new Error("--format must be text or json.");
    const { report, path } = await runAnalysis(locateProject(values.root), values.output, { paths: values.path });
    console.log(values.format === "json" ? JSON.stringify(report, null, 2) : `${render(report)}\n\nJSON report: ${path}`);
    process.exitCode = report.success ? 0 : 1;
  },
  async serve() {
    const { values } = options(rootOption);
    const { serve } = await import("../mcp/server.mjs");
    await serve(projectRoot(values));
  },
  "mcp-config"() {
    const { values } = options(rootOption);
    json(connectionConfig(projectRoot(values)));
  },
  guide() {
    const { positionals } = options({}, true);
    if (positionals.length !== 1) throw new Error("Usage: 510 guide TOPIC");
    console.log(readGuide(positionals[0]).markdown);
  },
  commit() {
    options();
    console.log(readGuide("commit").markdown);
  },
  pr() {
    const { values } = options({ base: { type: "string" } });
    if (values.base !== undefined) {
      if (!values.base.trim()) throw new Error("--base requires a non-empty branch name.");
      console.log(`PR request: ${JSON.stringify({ base: values.base })}\n`);
    }
    console.log(readGuide("pr").markdown);
  },
  handoff() {
    options();
    console.log(readGuide("handoff").markdown);
  },
  grill() {
    options();
    console.log(readGuide("grill").markdown);
  },
  spec() {
    options();
    console.log(readGuide("spec").markdown);
  },
  implement() {
    options();
    console.log(readGuide("implement").markdown);
  },
  debug() {
    options();
    console.log(readGuide("debug").markdown);
  },
  review() {
    const { values, positionals } = options(rootOption, true);
    if (positionals.length || values.root) {
      const root = locateProject(values.root);
      const paths = positionals.length ? sourcePaths(root, positionals) : undefined;
      console.log(`Review scope: ${JSON.stringify({ root, paths })}\n`);
    }
    console.log(readGuide("review").markdown);
  },
  refactor() {
    options();
    console.log(readGuide("refactor").markdown);
  },
  "install-rules"() {
    const { positionals } = options({}, true);
    if (positionals.length > 1) throw new Error("Usage: 510 install-rules [DESTINATION]");
    const path = copyRules(resolve(positionals[0] ?? "tools/oxlint/blindfolded"));
    console.log(`Copied the Blindfolded plugin to ${path}\nConfigure Oxlint with: ${path}/index.ts`);
  },
};

try {
  const bun = checkBun();
  if (!bun.ready && command !== "doctor") throw new Error(`Run 510 with Bun ${bun.expected}; found ${bun.installed ?? "a different runtime"}.`);
  if (!Object.hasOwn(commands, command)) throw new Error(`Unknown command: ${command}. Run 510 help.`);
  await commands[command]();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
