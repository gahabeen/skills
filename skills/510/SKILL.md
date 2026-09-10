---
name: "510"
disable-model-invocation: true
description: Use 510 for grilling plans with domain docs, writing and implementing specs, debugging bugs and performance regressions, conversation handoffs, committing the current thread's changes and packaging them into pull requests, project storage, toolchain, and AGENTS.md hierarchy initialization with 510 init, evidence-based code review with 510 review, behavior-preserving refactoring with 510 refactor, repository search, and static analysis of JavaScript or TypeScript. Coordinates the local 510 MCP tools and bundled CLI, including the complete Blindfolded suite.
---

# 510

Establish the requested outcome and inspect the repository's instructions and
working-tree state. Keep brainstorming exploratory, review focused on findings,
and implementation focused on the authorized change. Preserve unrelated work.

For authorized edits, follow [DOX documentation maintenance](runtime/guides/dox.md):
read the root-to-target `AGENTS.md` chain before editing, then update affected
contracts and child indexes before finishing. Keep this pass scoped to the work;
establish the project's hierarchy during `510 init`.

For code changes, apply the five [coding rules](runtime/guides/codebase-design.md#coding-rules):
purpose comments, authoritative data contracts, validation at trust boundaries,
helper reuse and ownership, and verification through consumers' public interfaces.

Prefer the current harness's native patching and file-editing tools for authored
changes. Use the tools available in the session to keep edits within the harness's
change-review feedback loop.

Use alternative editing methods only when native tools are unavailable or
unsuitable, and briefly explain why. Established formatters, generators, and
codemods remain appropriate for their intended tasks. Review the resulting changes
after each coherent batch, including new files, and preserve unrelated work.

## Choose the workflow

- **510 commit:** read [the commit guide](runtime/guides/commit.md). Use the
  current thread's history to select all its uncommitted changes, preserve
  unrelated work, and create one commit with a descriptive message from the diff.
- **510 pr [--base BRANCH]:** read [the PR guide](runtime/guides/pr.md). Package
  the thread's selected work, including earlier commits, into a draft PR or update
  its existing PR. Resolve the base, verify the complete comparison, commit
  outstanding work, and push the feature branch. The invocation authorizes this
  publication flow; merging remains separate.
- **510 handoff [next-session focus]:** read [the handoff guide](runtime/guides/handoff.md).
  Save a focused continuation document in the OS temporary directory and return
  its path, preserving decisions, unfinished work, and verification evidence.
- **510 grill [plan or decision]:** read [the grill guide](runtime/guides/grill.md).
  Use its bundled grilling and domain-modeling guidance to resolve decisions in
  rounds and capture agreed terminology and significant decisions as you go.
- **510 spec [subject]:** read [the spec guide](runtime/guides/spec.md). Synthesize
  the conversation into an actionable specification in the configured `specs`
  directory, defaulting to `.510/specs/`, without restarting the interview.
- **510 implement [spec path, tickets, or subject]:** read
  [the implementation guide](runtime/guides/implement.md). Build the selected work
  in tested slices, review standards and spec coverage, then commit locally unless
  the user requests otherwise. Reuse configured spec storage and bundled TDD guidance.
- **510 debug [symptom]:** read [the debug guide](runtime/guides/debug.md). Build a
  reproduction, test causes, and verify the fix. Keep evidence in the configured
  `debug` directory, defaulting to `.510/debug/`.
- **510 review [scope]:** read [the review guide](runtime/guides/review.md), then run and
  interpret the complete Blindfolded suite. Use a supplied or previously shared
  subdirectory/file as the one-run source scope via MCP `analyze.paths` or CLI
  `analyze --path PATH`, keeping the repository root for settings and storage.
- **510 refactor [scope or improvement]:** read [the refactoring guide](runtime/guides/refactor.md).
  Establish evidence, make the smallest coherent change, and verify behavior.
  Use its bundled design guidance for module interfaces and test seams.
- **Understand source:** use the connected 510 `find_files` and `search` tools.
  Existing FFF MCP tools can serve this purpose too. Search results help
  navigation; the analysis suite establishes its own coverage.
- **510 init, choose storage, update, or diagnose tooling:** read
  [toolchain initialization](runtime/guides/toolchain.md). Reuse existing settings; default
  new projects to `.510/`. The bundled CLI prepares storage and the MCP connection
  before an MCP server is available. For `510 init`, also establish or refresh the
  project's `AGENTS.md` hierarchy with the bundled DOX guide.
- **Install/update editable Oxlint rules:** read [installation](runtime/guides/install.md)
  or [updates](runtime/guides/update.md). Preserve local customizations.
- **Explain or extend a rule:** read [rule details](runtime/guides/rules.md),
  inspect the implementation, and verify accepted and rejected examples.

## Use the shared runtime

With the 510 MCP server connected, `doctor` checks readiness and `guide` retrieves
one relevant guide. `analyze` starts the complete suite; use its id with
`analysis_result` until finished. Wait between status requests, read every findings
page and coverage gap, and consult the full saved report for configuration and
scope details. `status: completed` does not imply `success: true`.

Commit, pr, handoff, grill, spec, implement, debug, review, and refactor are agent
workflows. Their CLI commands print instructions; the agent performs the workflow.
Handoff, grill, and spec need no toolchain initialization or analysis run.
The documentation pass in `510 init` is also agent work; CLI readiness confirms
the toolchain, not that project instructions have been written or verified.
Review and refactor use the complete static suite. Implementation and debugging run tests and
verification separately from static analysis. Commit follows the repository's
required checks before creating the commit. PR packaging follows those checks
and verifies the complete branch comparison before publication; reading its
guide needs no initialization.

Before saving a spec, implementation progress, or debug session, use MCP `paths` or CLI `paths --root PATH`
and follow [workflow storage](runtime/guides/workflow-storage.md). Reuse the
configured location without asking for the storage choice again. The lookup
does not install anything or create files.

The same operations are available through
`bun <skill-directory>/scripts/510.mjs`. Use `init` to install the pinned toolchain,
`doctor` to inspect readiness, and `analyze --root /path/to/project` to run analysis.
The installed skill is read-only. Keep runtime dependencies, caches, reports, and
analysis temporary files in the configured project or shared storage. Workflow
documents use the destinations specified in their guides.
If an expected tool is unavailable, report that gap and follow the initialization guide;
do not imply the server is connected merely because its files are installed.

## Preserve the evidence contract

All supported static analyzers run by default, with no per-tool opt-ins. Every
finding blocks success, including Review signals. Missing required coverage also
fails, retaining partial results. Preserve application build configuration and
use the dedicated analysis profiles. Analysis may evaluate tooling configuration
but never starts the application, tests, builds, generation, or benchmarks.

Keep demonstrated defects (**Fix**), adopted constraints (**Enforce**), and
contextual signals (**Review**) distinct. Complexity alone does not justify a
refactor. Local mutation alone does not establish impurity. Explain uncertainty;
use [effects and testability](runtime/guides/effects-and-testability.md) when relevant.

Do not suppress findings, weaken thresholds, or obscure missing coverage to get
a pass. For authorized code changes, run appropriate verification separately
from static analysis. Finish with the resulting behavior, evidence, and remaining
findings or limitations. Instructions guide judgment; the runtime enforces the
automated analysis contract.
