# Run the static suite

The skill is self-contained: runtime source, workflow guides, a private toolchain manifest,
and its Bun lockfile travel together. Bun 1.4.2 runs every analyzer and manages
their dependencies in the configured storage outside the installed skill, without modifying the consuming project's package manifest,
lockfile, or build configuration.

Blindfolded is the analysis capability within 510. See [toolchain initialization](toolchain.md)
for MCP connection, readiness checks, and shared dependency management.

## Initialization and execution

Run **510 init** for each project, or after a toolchain update. Existing storage choices are reused:

```sh
bun <skill-directory>/scripts/510.mjs init
```

`init` installs the pinned toolchain with its frozen lockfile and package lifecycle
scripts disabled. Then run from the consuming repository:

```sh
bun <skill-directory>/scripts/510.mjs analyze
```

Use `--root /path/to/project` from another directory. `--format json` prints the
structured report; the default prints a readable report. Every run also writes
`.fiveten/reports/report.json` by default, or the configured reports directory. `--output <path>` changes that output
location. There are no per-tool switches.

Use `--path packages/billing` for a one-run source scope; repeat `--path` for
additional files or directories. MCP `analyze` accepts the same selection as
`{ "paths": ["packages/billing"] }`. Paths are relative to the repository root
(including when invoked from a nested working directory), or absolute within it.
This overrides configured `paths` for the run without saving changes. Keep
`--root` at the repository so storage, thresholds, ignores, and explicit project
and analyzer configurations are reused. Without a path selection, saved settings
and default discovery apply as before.

The agent's plain `510 review` workflow explicitly supplies `paths: ["."]`
or `--path .` for repository-wide assessment. It does not inherit a saved subtree.
Explicit review paths select that area. Review also inspects architecture, tests,
and documentation as described in the [review guide](review.md). Those contextual
assessments are separate from the automated report and its pass/fail result.

`init` maintains `.fiveten/.gitignore` for generated files. The installed skill is read-only.

The command exits zero only when every required analyzer completes and there are
zero findings. Review warnings also fail. A missing binary, invalid configuration,
timeout, parser failure, or missing type/dependency coverage produces a coverage
gap and a failing result. Other analyzers continue and their findings remain in
the report. Application startup, test commands, build scripts, and code-generation
scripts are never invoked by this command. Project tooling configuration may be
evaluated by the analyzers.

## Default checks

| Analyzer | Checks |
| --- | --- |
| Oxlint + tsgolint | All 18 Blindfolded rules, correctness checks, accumulating spreads, floating/misused promises, exhaustive switches, cyclomatic complexity, nesting. |
| TypeScript | Dedicated no-emit profiles enabling `strict`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes`. |
| Knip | Unused files, exports, types, and dependencies; unresolved references and configuration hints. Framework entry discovery remains active. |
| Dependency-cruiser | Import cycles, unresolved dependencies, and declared project architecture rules. Type-only dependencies are included. |
| ESLint + SonarJS | Cognitive complexity through the TypeScript parser. |
| Fallow | Duplicate code, with source discovery and parser coverage checks. |

Cyclomatic complexity uses the classic variant and reports values above 20;
nesting reports depths above 4; cognitive complexity reports values above 15.
These are configurable review policies, not validated quality boundaries. Every
reported result blocks success. `void promise` does not handle rejection and is
reported; await the work, return it to its caller, or handle rejection explicitly.
A default switch branch does not exempt missing union members.

Fallow reports clone groups with at least 50 tokens and 5 lines by default.
Its `mild` mode ignores comments and whitespace. Module wiring, such as imports
and re-exports, does not count as duplicate code. Each group is a blocking
**Review** signal with all occurrence locations. Similar code does not establish
a shared responsibility or justify merging implementations.

Fallow compares an isolated copy of exactly the selected files. It includes
selected tests and declarations, disables its default duplicate ignores, and
does not load the consuming project's Fallow configuration or baselines.
Discovery and parser checks detect missing files or degraded parsing before
the result can pass. Valid clone findings survive parser failures elsewhere.
Snapshot files and binary verification data stay in temporary analysis storage.

Copies outside a selected scope are not compared. Fallow's duplicate statistics
describe files eligible under the token and line minimums. They are not the
number of files discovered or parsed; the report records those counts separately.
Fallow's health command provides parser diagnostics only. The suite keeps its
existing complexity, reachability, and dependency analyzers.

The pinned Oxlint typed backend can choose the nearest application tsconfig even
when given a dedicated config path. The separate TypeScript compiler check still
enforces the stricter analysis profile. The suite records the backend's actual
project assignments, fails on unmatched files, and reports a coverage gap when
an enabled typed rule cannot run under the application's settings (for example,
disabled strict null checks). It does not silently change application settings.

CodeQL and runtime analysis are outside this version. Effect descriptions and
testability judgments use the [contextual review workflow](effects-and-testability.md).

## Source scope and project metadata

By default, discover JS/TS source and `tsconfig*.json`/`jsconfig*.json` projects
under the repository. Common dependency, generated-output, and installed-agent
directories are excluded; the report lists those exclusions. The installed skill
itself is excluded. Do not count excluded files as inspected.

For a one-run path selection, automatic compiler configuration discovery is
limited to the selected directories and their ancestors. Explicit `projects`
remain authoritative, including configurations stored elsewhere in the repository.
The report records the effective source paths and whether they came from the
request or saved/default configuration. Invalid, missing, outside-repository,
or source-empty selections fail; they never trigger a full-repository fallback.

For explicit project boundaries, put an `analysis` object in `.fiveten/config.json`.
Existing `.blindfolded.json` files with the following shape remain supported when
that object is absent:

```json
{
  "paths": ["src", "test"],
  "ignore": ["src/generated/**"],
  "projects": ["tsconfig.json", "test/tsconfig.json"],
  "thresholds": {
    "cyclomatic": 20, "nesting": 4, "cognitive": 15,
    "duplicateTokens": 50, "duplicateLines": 5
  }
}
```

`paths` are existing files or directories, `ignore` contains glob patterns, and
`projects` identifies existing compiler configurations. With no project config,
the suite creates an inferred JS/TS analysis profile. With existing configs,
selected source must belong to at least one project; uncovered files fail with
an explicit gap. Each profile preserves its base settings and enables stricter
contracts without emitting or building referenced packages. Imported files may
also need to be read to establish types and dependencies.

Do not broaden ignores to conceal owned source. Configure real generated-output
boundaries and entry points. For monorepos, specify the relevant leaf configs
when automatic discovery includes unrelated build presets. Missing referenced
declarations remain a gap; the suite does not run package builds to create them.

Additional optional **configuration paths** (not optional analyzers) are:

- `knipConfig`: the project's Knip configuration. Standard Knip filenames and
  `package.json#knip` are discovered by default. Preserve real framework entries,
  workspaces, and dynamic-loading knowledge. The suite retains its required issue
  categories even when an existing configuration disables them.
- `dependencyConfig`: the project's dependency-cruiser configuration. Standard
  `.dependency-cruiser.{cjs,js,mjs,json}` files are discovered automatically.
  Existing boundaries are combined with cycle/resolution checks. Without declared
  boundaries, report that fact; do not invent application layers. Configure
  project-specific alias resolution for multi-project graphs.
- `oxlintConfig`: an existing configuration to extend with additional local
  rules. Mandatory suite rules remain enabled. Nested configurations are disabled
  for this dedicated run; application lint settings remain separate.

Knip and dependency-cruiser configuration objects must be serializable. JSON/JSONC
and Bun 1.4.2-compatible JS/TS object exports are supported. Unsupported config
evaluation or resolution fails explicitly. Knip may inspect additional discovered
tooling entry points; its report records processed-file counts and enabled plugins.
For a one-run path scope, Knip selects the owning workspaces and applies source
patterns within each, preserving their entry and plugin settings. Its report
records selected and included workspaces; ancestors and related workspaces may
still provide dependency context. Unrelated sibling workspaces are not selected.

Embedded scripts in Vue, Svelte, and Astro files are reported as unsupported
coverage when selected. Computed imports and dynamic behavior can still require
manual review. A completed scan proves neither reachability under every possible
runtime loader nor whole-program correctness.

## Reports

The JSON report includes `success`, selected files and exclusions, thresholds,
per-analyzer status/configuration, findings, coverage gaps, and limitations. Each
finding includes tool/rule identity, classification, location where available,
evidence, uncertainty, and a proposed action. Complexity findings carry measured
values and configured limits. File-level and graph findings may have no line
number; do not invent one.

Keep raw diagnostics and partial findings available. Tool classifications are
initial interpretations; source review may refine them. Never present a warning
as a demonstrated defect merely because it blocks the analysis command.
