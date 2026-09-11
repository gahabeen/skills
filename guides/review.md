# 510 review

Apply the shared [output guidance](output.md) to user-facing replies and authored prose.

Assess the repository, explain supported problems, and recommend priorities.
Review preserves application source, tests, configuration, and documentation.
Save analysis reports in configured storage. Fixes belong to an authorized change workflow.

## Select the scope

**Plain `510 review` assesses the whole repository.** Locate its root from the
working directory or an explicit repository location. Pass `paths: ["."]` to MCP
`analyze`, or `analyze --root /path/to/repo --path .` to the CLI. This overrides
saved source paths for this run. Do not silently reuse a directory mentioned
earlier in the conversation or restrict the review to the current diff.

**`510 review <path>` assesses that area.** Honor an explicit scope in the current
request, including an explicit request to continue an earlier scoped review.
For example, `510 review packages/billing` passes `paths: ["packages/billing"]`
or `analyze --root /path/to/repo --path packages/billing`. Repeat paths for
multiple targets. Keep the repository root for settings and storage.

When another workflow calls review, use that workflow's declared scope and
comparison. The whole-repository default applies to a standalone bare invocation.

Preserve saved settings, thresholds, ignores, and explicit project configurations.
Disclose exclusions and unsupported source. A narrow compiler configuration can
leave coverage gaps in a repository-wide run; report them without rewriting it.
Invalid or empty selections must fail explicitly, without broadening the scope.
The low-level `analyze` command still uses saved paths when none are supplied.

## Establish coverage

Read the applicable `AGENTS.md` instructions and working-tree status. Inventory
the selected first-party packages, source roots, public entrypoints, dependencies,
tests, CI checks, and maintained docs. Read domain terminology and relevant
architecture decisions. Include existing code and local changes within scope.

Use this inventory to cover each substantive area, including areas without
analyzer findings. Trace representative behavior through its actual callers and
boundaries. Scale the depth to the area and its risks. Record what was inspected,
sampled, excluded, or unavailable. Repository-wide scope does not mean every line
or runtime path was verified. Report unfinished required assessment as a gap.

For scoped reviews, inspect external callers and contracts when necessary.
Disclose that context without turning unrelated areas into review targets.

## Run the complete static suite

Follow [analysis setup and reporting](analysis.md). Toolchain preparation and
reports may write to configured 510 storage. Do not perform `init`'s documentation
edits during review. Report documentation problems in the assessment below.

Run Oxlint, strict TypeScript analysis, Knip, dependency-cruiser, SonarJS, and
Fallow together. Confirm the report's selected files and exclusions match the
intended scope. Keep every analyzer enabled and use dedicated analysis settings.
Preserve application build configuration.

Read every findings page, analyzer status, and coverage gap. Every finding fails
the analysis, including Review signals. An incomplete required analyzer also
fails the run. Retain partial results and pre-existing findings.

Static analysis may evaluate tooling configuration. It does not start the
application, tests, builds, generation, or benchmarks. Inspect test and CI
definitions as source. Separately requested runtime verification remains separate
from this static command. Never label an unrun check as passing.

## Assess the source beyond analyzer findings

| Area | Evidence to inspect |
| --- | --- |
| Architecture and contracts | Responsibilities, public interfaces, actual callers, dependency direction, shared data ownership, and validation where trust changes. Look for concrete leaks or conflicting contracts. |
| Behavior and test coverage | Match important public behavior, errors, state transitions, and integrations to test assertions. Check whether tests reach the interface consumers use and whether CI selects them. |
| Documentation and instructions | Compare maintained docs, setup/check commands, entrypoint descriptions, domain terms, and relevant `AGENTS.md` links against the source and configuration. |

Use [codebase design](codebase-design.md) to assess interface depth, ownership,
and caller knowledge. Use [effects and testability](effects-and-testability.md)
for hidden inputs, observable effects, coordination, and unresolved operations.
Local mutation alone does not establish impurity.

Use [architecture improvement](improve-codebase-architecture.md) to develop
supported structural candidates and compare their effects on callers and tests.
Its use of recent changes helps prioritize inspection within this review's scope.
It does not narrow required coverage, replace the full report, or authorize edits.

Test existence does not establish behavior coverage. Existing coverage reports
can support the assessment only with their scope and freshness stated. Do not
invent percentages, execution results, or a requirement for a new test where
existing coverage already establishes the contract.

Documentation findings need a concrete consequence, such as a broken setup
command or misleading ownership rule. Do not demand a document for every folder
or treat a missing preferred template as a defect. Inspect the instruction
hierarchy using [DOX guidance](dox.md), without editing it.

For complexity findings, record the metric, variant, and threshold. A metric
alone does not justify splitting a function. Verify dynamic usage before
proposing removal of code reported as unused.

For Fallow clone groups, compare every occurrence, its callers, and its reason
to change. Record the token/line minimums and comparison scope. Shared syntax
alone does not justify a common abstraction. Copies outside selected files are
not compared. Preserve ownership, callback order, omission semantics, and useful
type information in proposed changes.

## Return priorities and evidence

Keep severity separate from classification. Prioritize by demonstrated impact,
likelihood, and affected scope. Explain the priority without inventing a quality score.

| Kind | Evidence |
| --- | --- |
| **Fix** | A demonstrated defect or broken runtime contract. |
| **Enforce** | A violation of an adopted coding, type, or dependency constraint. |
| **Review** | A supported structural, testability, or documentation concern that needs judgment. |

Tool classifications are starting points. Reclassify when source evidence
warrants it, and explain why. Keep contextual judgments distinct from automated
results. All remaining findings and incomplete required checks block success.

Return the overall outcome, followed by prioritized findings with source links,
classification, evidence, consequence, uncertainty, and a proposed action.
Group repeated diagnostics when useful, retaining their locations and the full
report reference. Include analyzer results and coverage for architecture, tests,
and docs. State which runtime checks were not run and what remains uninspected.
A clean static report alone does not establish a successful overall review.

Recommend a coherent first set of changes without starting them. Route structural
improvements to `510 refactor` and bugs needing diagnosis to `510 debug`.
The usual sequence is review, select priorities, refactor, then review again.
A review request alone does not authorize source or documentation edits, commits, or publication.

The CLI `review` command returns the resolved scope and this guide. The agent
performs the assessment. `510 doctor` continues to check 510 tooling readiness.
