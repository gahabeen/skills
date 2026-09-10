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
| `paths` | Resolve configured spec and debug directories without writes or initialization. |
| `guide` | Load commit, handoff, grill, spec, implement, TDD, debug, design, review, refactoring, or initialization instructions. |
| `find_files` | Find files through FFF's persistent repository index. |
| `search` | Search contents using literal OR patterns, constraints, and pagination. |
| `analyze` | Start the complete Blindfolded static suite. |
| `analysis_result` | Retrieve status, coverage gaps, and findings in pages. |

Each server process is bound to the repository supplied through `--root`.
It uses stdio, needs no hosted service, and keeps analysis and search local.
Tooling configuration can execute during analysis. Search caches and reports use
the configured storage outside the installed skill. Installation readiness and agent connection readiness are
reported separately.

## Blindfolded analysis

Blindfolded is the internal analysis capability. Its checks remain unchanged:

| Analyzer | Evidence |
| --- | --- |
| Oxlint + tsgolint | 18 custom rules, correctness, promises, exhaustive switches, cyclomatic complexity, nesting. |
| TypeScript | Dedicated strict indexed-access and optional-property contracts. |
| Knip | Unused code/dependencies and reachability/configuration problems. |
| Dependency-cruiser | Import cycles, unresolved dependencies, and declared architecture boundaries. |
| ESLint + SonarJS | Cognitive complexity. |

Every finding blocks success, including Review signals. Incomplete required
analyzers also fail while preserving partial results. All tools run by default.
Application startup, tests, builds, generation, and profiling are outside analysis.
Build settings are preserved. Contextual effects and testability review remains
an agent workflow, separate from automated diagnostics.

The CLI runs the same analysis engine without needing an MCP connection:

```sh
bun <skill-directory>/scripts/510.mjs analyze --root /path/to/project
```

By default it writes `.510/reports/report.json`; `--format json` selects structured stdout.
MCP jobs save full reports to `.510/reports/runs/<id>.json` by default. A completed job may
still have `success: false`. See [analysis configuration and limits](../guides/analysis.md)
and [the evidence vocabulary](../CONTEXT.md).

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

Storage choices and update behavior are recorded in
[the storage decision](adr/0005-project-storage-and-setup.md).

The migration from the standalone Blindfolded skill is recorded in
[the architecture decision](adr/0003-one-skill-shared-runtime.md). Existing
`.blindfolded.json`, report formats, and vendored `blindfolded/` rule names remain
compatible; install the `510` skill and use its launcher for new installations.

## Attribution

The handoff, grill, spec, implement, and debug workflows adapt Matt Pocock's
[skills](https://github.com/mattpocock/skills), including their grilling, domain
modeling, TDD, review, and codebase-design support. See [source and adaptations](../guides/upstream/mattpocock-skills/UPSTREAM.md)
and the preserved [MIT license](../guides/upstream/mattpocock-skills/LICENSE).

Blindfolded derives from [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop)
revision [c44ef22](https://github.com/dmmulroy/anti-slop/commit/c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b).
The Effect-specific plugin was removed. See [LICENSE](../LICENSE) and
[source provenance](../src/blindfolded/oxlint/UPSTREAM.md). Vendored ESLint Stylistic
code retains its MIT license and attribution. FFF and the MCP SDK are upstream
dependencies, not reimplementations; their licenses travel with installed packages.
