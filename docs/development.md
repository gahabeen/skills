# Tooling and development

This is the technical reference for the tools behind 510 and for working on this
repository. For what the skills do and how to get started, see the [README](../README.md).

510 includes a local MCP server and a CLI that share the same capabilities.
Bun manages their dependencies. Installation comes directly from
[gahabeen/skills](https://github.com/gahabeen/skills); all packages are private
and nothing is published to npm.

## Local tools

The local server exposes:

| Tool | Purpose |
| --- | --- |
| `doctor` | Check runtime, package versions, and native search readiness. |
| `paths` | Resolve configured exploration, spec, and debug directories without writes or initialization. |
| `guide` | Load public workflow instructions and internal guides for output, agent documents, architecture, design, DOX, testing, and storage. |
| `profile` | Read selected package/configuration evidence and recommend applicable environment guides without setup or execution. |
| `find_files` | Find files through FFF's persistent repository index. |
| `search` | Search contents using literal OR patterns, constraints, and pagination. |
| `analyze` | Start the complete Blindfolded static suite. |
| `analysis_result` | Retrieve status, coverage gaps, and findings in pages. |

`guide implement` returns the complete compact workflow. Use
`guide implement --phase select|build|verify|finish` to retrieve one section
from that same document, and `guide rules --rule blindfolded/RULE` to retrieve one
rule's applicability and examples. MCP `guide` accepts the corresponding `phase`
and `rule` fields. The same registry resolves both interfaces. References are
deferred; retrieval does not expand linked instructions.

`reporting` remains a compatibility topic for the shared `output` guide.
`performance`, `analysis-reference`, and `analysis-reports` hold conditional
measurement, analyzer configuration/coverage, and report-comparison guidance.

`profile --root PATH --path PACKAGE_OR_FILE` returns the closest package and its
ancestors, compiler declarations, metadata hashes, scripts, gaps, and candidate
environment guides. It reads JSON/JSONC as data, never runs project scripts, and
does not resolve arbitrary config inheritance. Select each affected workspace
and confirm relevance before loading Node, browser, React/Next.js, or monorepo guidance.

Each server process is bound to the repository supplied through `--root`.
It uses stdio, needs no hosted service, and keeps analysis and search local.
Tooling configuration can execute during analysis. Search caches and reports use
the configured storage outside the installed skill. Installation readiness and agent connection readiness are
reported separately.

`510 explore [subject ...] [--root PATH]` prints the [exploration workflow](../guides/explore.md)
with the requested context. `510 guide explore`, MCP `guide` with `topic: "explore"`,
and `five-ten://guides/explore` expose the same instructions. Guide retrieval and
`paths` are read-only; the agent maintains the document under the returned
`explorations` path, defaulting to `.fiveten/explorations/`, unless discussion only
was requested. No toolchain initialization is needed to read the CLI guide or
resolve storage.

`510 pr [--base BRANCH]` prints the [PR workflow](../guides/pr.md) with an optional
requested base; the agent resolves repository state and performs publication.
`510 guide pr`, MCP `guide` with `topic: "pr"`, and `five-ten://guides/pr` expose
the same instructions. Reading the guide has no Git or hosting side effects and
requires no initialization; publication uses the agent's Git and GitHub tools.

`510 merge conflicts` prints the [conflict workflow](../guides/merge-conflicts.md).
`510 guide merge-conflicts`, MCP `guide` with `topic: "merge-conflicts"`, and
`five-ten://guides/merge-conflicts` return the same instructions without inspecting
or mutating Git. The agent resolves the active operation and follows the project's
required checks before completing it locally.

`writing-for-agents` and `improve-codebase-architecture` are internal guide topics,
available through `guide` and the corresponding `five-ten://guides/` resources.
The output and DOX guides reference writing guidance when authoring agent documents.
Explore, review, and refactor reference architecture guidance when comparing structural
improvements. They add no standalone commands, packages, or runtime dependencies.

## Blindfolded analysis

The agent's `510 review` workflow defaults to a whole-repository checkup.
Its CLI resolves the repository root and returns `paths: ["."]` with the guide.
Explicit paths narrow the review. The agent passes those paths to the shared
analysis engine, overriding saved source paths for that run without changing
settings. MCP users read `guide` with `topic: "review"` and pass the same paths
to `analyze`. An `analyze` call without paths still uses saved/default discovery.

Review also assesses architecture, behavior coverage in tests, and maintained
documentation through source inspection. It reports priorities and incomplete
coverage without source edits. It does not run tests or builds by default.
Refactoring and implementation reuse this assessment within their declared scope.
`doctor` remains a tooling readiness check.

Blindfolded is the internal analysis capability. It runs these checks:

| Analyzer | Evidence |
| --- | --- |
| Oxlint + tsgolint | 18 custom rules, correctness, promises, exhaustive switches, cyclomatic complexity, nesting. |
| TypeScript | Dedicated strict indexed-access and optional-property contracts. |
| Knip | Unused code/dependencies and reachability/configuration problems. |
| Dependency-cruiser | Import cycles, unresolved dependencies, and declared architecture boundaries. |
| ESLint + SonarJS | Cognitive complexity. |
| Fallow | Duplicate code in selected files, with discovery and parser coverage. |

Every finding blocks success, including Review signals. Incomplete required
analyzers also fail while preserving partial results. All tools run by default.
Application startup, tests, builds, generation, and profiling are outside analysis.
Build settings are preserved. Contextual effects and testability review remains
an agent workflow, separate from automated diagnostics.

The CLI runs the same analysis engine without needing an MCP connection:

```sh
bun <skill-directory>/scripts/510.mjs analyze --root /path/to/project
```

By default it writes `.fiveten/reports/report.json`; `--format json` selects structured stdout.
MCP jobs save full reports to `.fiveten/reports/runs/<id>.json` by default. A completed job may
still have `success: false`. See [analysis configuration and limits](../guides/analysis.md)
and [the evidence vocabulary](../CONTEXT.md).

Schema version 2 adds checkout-independent diagnostic IDs and grouping. Use
`analyze --baseline previous.json` for comparison without suppression, or
`report report.json --baseline previous.json --view groups` to inspect saved
evidence. Group IDs select location-preserving pages with `report --group ID`.
MCP `analysis_result` supports `view` and `groupId`. All findings and gaps remain
blocking; `reviewStatus: "not-tracked"` separates retrieval from human assessment.
See the [reporting contract](../guides/analysis-reports.md) for identity and comparison limits.

Editable Oxlint rules can still be copied with
`bun <skill-directory>/scripts/510.mjs install-rules [destination]`.
See [installation](../guides/install.md) and [updates](../guides/update.md).

## Project layout

```text
skills/510/
  SKILL.md                  Public working-mode entrypoint
  agents/                   Agent display metadata
  scripts/510.mjs            Installed CLI/server launcher
  runtime/                  Generated self-contained distribution
src/
  cli/                      Command parsing and terminal output
  mcp/                      MCP tools, resources, and transport
  blindfolded/
    analysis/               Complete suite and analyzer adapters
    oxlint/                 Custom rules, regression tests, licenses
    run.mjs                 Shared execution and report persistence
    jobs.mjs                Analysis job lifecycle
    install.mjs             Editable-rule copying
  search/                   FFF integration
  runtime/                  Dependency loading, setup, health, guides
guides/                    Canonical workflow instructions
toolchain/                 Private runtime manifest and bun.lock
tests/                     Installation, analysis, runtime, and MCP tests
scripts/                   Development validation and bundle generation
docs/                      Decisions and coverage records
```

Edit `src/`, `guides/`, or `toolchain/`, then regenerate the installed bundle.
Do not edit `skills/510/runtime/` directly. The public skill, metadata, and thin
launcher are authored in place. The bundle contains all production runtime code,
guides, dependencies manifest/lockfile, and upstream licenses; it excludes tests
and installed dependencies.

## Development

The `510 init` agent workflow includes [AGENTS.md hierarchy maintenance](../guides/dox.md).
CLI setup returns the guide in `documentation` with status `agent-action-required`;
the agent inspects and writes project-specific instructions. Toolchain `ready`
does not establish documentation completion. Subsequent editing workflows maintain
affected docs. Guide retrieval is read-only through CLI, MCP, and resources.

Bun **1.4.2** runs the CLI, MCP server, analyzers, and integration tests. Node
**24.x** is needed only for developing and testing custom Oxlint rules: the pinned
Oxlint `RuleTester` does not support Bun. `bun run check` includes those Node tests;
installing and using the skill does not require Node. See [the runtime decision](adr/0004-bun-runtime.md).

```sh
bun install --frozen-lockfile
bun run init
bun run sync:skill
bun run check
```

Use `bun run 510 <command>` for the shared CLI. Shortcuts include `bun run doctor`,
`bun run analyze`, and `bun run mcp --root /project`. `bun run setup:analysis` and
`bun run sync:skill-assets` remain aliases for existing development workflows.

`check` validates implementation behavior, isolated installations, real MCP
requests, static types, skill links, and bundle synchronization. `analyze` applies
the complete policy to this repository and may fail on existing findings or
coverage gaps. These are separate outcomes.

Behavioral evaluation scenarios, isolated fixture preparation, a runner adapter,
and measured-result summaries are documented in [510 evaluations](evaluations.md).
Use `bun run eval:510 list` to inspect the cases. These maintainer assets
stay outside the installed skill; they do not add discovery context or runtime dependencies.

Storage choices and update behavior are recorded in
[the storage decision](adr/0005-project-storage-and-setup.md).

The migration from the standalone Blindfolded skill is recorded in
[the architecture decision](adr/0003-one-skill-shared-runtime.md). Existing
`.blindfolded.json`, report formats, and vendored `blindfolded/` rule names remain
compatible; install the `510` skill and use its launcher for new installations.

## Attribution

The shared output guide adapts [danyuchn/asd-ste100-skill](https://github.com/danyuchn/asd-ste100-skill).
See [source and adaptations](../guides/upstream/asd-ste100-skill/UPSTREAM.md)
and the preserved [MIT license](../guides/upstream/asd-ste100-skill/LICENSE).
Fallow is a pinned dependency from [fallow-rs/fallow](https://github.com/fallow-rs/fallow).
Its MIT license travels with the installed package. The adapter uses its CLI;
it does not vendor or modify the analyzer.

Project documentation maintenance adapts [Agent Zero's DOX](https://github.com/agent0ai/dox).
See [source and adaptations](../guides/upstream/agent0ai-dox/UPSTREAM.md) and the
preserved [MIT license](../guides/upstream/agent0ai-dox/LICENSE).

The handoff, grill, spec, implement, debug, and merge-conflict workflows adapt Matt Pocock's
[skills](https://github.com/mattpocock/skills), including their grilling, domain
modeling, TDD, review, codebase-design, architecture improvement, and writing support.
See [source and adaptations](../guides/upstream/mattpocock-skills/UPSTREAM.md)
and the preserved [MIT license](../guides/upstream/mattpocock-skills/LICENSE).

Blindfolded derives from [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop)
revision [c44ef22](https://github.com/dmmulroy/anti-slop/commit/c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b).
The Effect-specific plugin was removed. See [LICENSE](../LICENSE) and
[source provenance](../src/blindfolded/oxlint/UPSTREAM.md). Vendored ESLint Stylistic
code retains its MIT license and attribution. FFF and the MCP SDK are upstream
dependencies, not reimplementations; their licenses travel with installed packages.
