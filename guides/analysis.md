# Run the static suite

Blindfolded is 510's analysis capability. Use ready tooling; consult
[toolchain](toolchain.md) when initialization, dependencies, or connection setup
is needed. Bun runs the pinned analyzers from configured storage. Keep the installed
skill read-only and preserve the consuming project's manifest, lockfile, and build
configuration. Review may prepare tooling and save reports, but does not perform
`init`'s project-documentation edits.

## Run the selected scope

```sh
bun <skill-directory>/scripts/510.mjs analyze --root /path/to/project --path packages/billing
```

Repeat `--path` for multiple targets. MCP `analyze` accepts the same selection
with `paths`. Paths are relative to the repository root, or absolute within it.
Keep the root at the repository so settings and storage are reused. A one-run
selection overrides saved source paths without changing configuration.

Bare `510 review` explicitly selects `--path .` / `paths: ["."]`.
An explicitly scoped review or a parent workflow uses its selected scope.
Low-level `analyze` without paths uses saved settings and default discovery.
Invalid, outside-repository, missing, or source-empty selections fail without
broadening scope.

Run all six analyzers: Oxlint + tsgolint, TypeScript, Knip, dependency-cruiser,
ESLint + SonarJS, and Fallow. There are no per-tool switches. Static analysis
may evaluate tooling configuration; it never starts the application, tests,
builds, generation, or benchmarks. Run authorized runtime verification separately.

## Assess the evidence

Confirm selected files, exclusions, and analyzer coverage. Read every findings
page, status, and gap. Success requires all required analyzers to complete and
zero findings, including Review signals. Missing tools, configuration or parser
failures, timeouts, and incomplete type/dependency coverage fail the run while
retaining partial findings. Completion alone does not mean success.

Distinguish defects (Fix), adopted constraints (Enforce), and contextual signals
(Review). A complexity score, repeated syntax, or local mutation alone does not
establish a defect or justify refactoring. Keep classifications separate from
severity and automated pass/fail. Never weaken policy or exclusions to hide evidence.
The [review workflow](review.md) adds contextual architecture, test, and documentation
assessment; a clean static report does not establish whole-program correctness.

## Conditional references

- [Analyzer checks and limits](analysis-reference.md#default-checks): interpreting
  a tool's coverage, thresholds, or diagnostic limitations.
- [Configuration and discovery](analysis-reference.md#source-scope-and-project-metadata):
  setting project boundaries, resolving configuration, or investigating coverage gaps.
- Individual diagnostic: `guide rules --rule RULE`, or MCP topic `rules` with `rule`.

## Reports

CLI saves `.fiveten/reports/report.json` by default; MCP jobs save reports under
the configured reports directory. `--format json` selects structured stdout and
`--output PATH` selects another report path. Read [report retrieval and comparison](analysis-reports.md)
when paging/grouping saved findings, comparing a baseline, or interpreting identities.
Grouping and comparison never suppress evidence or change success. Use
[output guidance](output.md) when delivering the result.
