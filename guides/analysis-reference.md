# Analyzer configuration and coverage

Use this reference when configuring the [static suite](analysis.md) or interpreting
an analyzer's scope and limitations.

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

Oxlint's `--tsconfig` controls import resolution; the pinned typed backend ignores
it and discovers projects from source locations. There is no supported explicit
project selector in its headless interface. See the [CLI contract](https://oxc.rs/docs/guide/usage/linter/cli.html)
and [pinned backend implementation](https://github.com/oxc-project/tsgolint/blob/v7.0.2001/cmd/tsgolint/headless.go).
The standalone backend CLI labels itself unsupported. Its source-override protocol
is not an explicit compiler-project selector; 510 does not substitute compiler
files or relocate source to coerce discovery.

The separate TypeScript check enforces the strict analysis profile. Typed-lint
scope records that requested profile separately from every actual file-to-project
assignment. Each unmatched or unconfirmed selected file is a coverage gap, as are
inconsistent project counts and enabled rules blocked by compiler settings such
as disabled strict null checks. A strict review config can therefore complete
TypeScript coverage while tests or JavaScript remain outside typed lint. All
available findings and backend logs survive these gaps. Application settings,
source identities, declarations, and import resolution stay intact.

Policy `510-typed-coverage-2` requires per-file assignment evidence. Reports from
older policies are not comparable as successful baselines; unchanged finding
fingerprints do not establish equivalent coverage or compiler settings.

CodeQL and runtime analysis are outside this version. Effect descriptions and
testability judgments use the [contextual review workflow](effects-and-testability.md).

## Source scope and project metadata

Analyzer subprocesses capture stdout and stderr through temporary files in the
configured storage. This avoids incomplete native CLI output under Bun pipe
capture. Each stream has a 32 MiB acceptance limit, checked every 10 ms and again
before reading; disk usage can briefly exceed it between checks. A two-minute
command deadline and worker cancellation terminate the subprocess group and
release capture files. Workers retain their five-minute deadline and 32 MiB
report limit. Invalid JSON reports byte counts and bounded head/tail evidence.

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
