# 510 review

Use the scope after `510 review`, or the review scope already established in the
conversation.

When the user supplies a directory or file, including a path shared earlier in
the conversation, use it as the source scope for this run. For example,
`510 review packages/billing` selects that directory. Keep the repository root
for settings and storage; pass `paths: ["packages/billing"]` to MCP `analyze`, or
`analyze --root /path/to/repo --path packages/billing` to the bundled CLI.
Repeat `--path` or supply multiple MCP paths for several targets. Paths are
repository-relative or absolute within that repository. Do not rewrite saved
analysis settings or substitute the subdirectory for the repository root.

Confirm the selected paths and files in the report before interpreting findings.
All analyzers still run on the selected scope. Imports, ancestor configuration,
and discovered tooling entry points may require context outside it; disclose
that context and retain resulting findings and coverage gaps. A scoped pass
only establishes coverage of its recorded scope. Invalid or empty selections
must fail explicitly, without falling back to the whole repository.

Make each proposed change answer a specific finding. Analyze source and project
metadata without starting the application, its tests, builds, or benchmarks.
Evaluating tooling configuration is allowed. Do not run generation scripts to
fill missing type information; report the resulting coverage gap.

## Choose the work

Read the repository's agent instructions and working-tree status. Establish the
requested scope, source roots, project configurations, and existing architecture
and coding constraints before changing anything.

- **Review or cleanup:** follow the workflow below and read
  [Run the static suite](analysis.md) for setup, scope, and reporting.
- **Install or update editable Oxlint rules in a repository:** read
  [Install a vendored plugin](install.md) or
  [Update a vendored installation](update.md). This integration
  accompanies the complete analysis suite.
- **Explain or extend a rule:** read its [rule reference](rules.md),
  inspect the implementation, and verify accepted and rejected examples.

## Review and cleanup

1. Prepare the skill's isolated toolchain and run the complete analysis command.
   Oxlint, strict TypeScript analysis, Knip, dependency-cruiser, and SonarJS all
   participate by default. Do not offer per-tool opt-ins, substitute visual
   estimates for measured complexity, or label a missing check as a clean result.
   Use dedicated analysis settings; preserve application build configuration.
2. Read the combined report, including analyzer status and coverage gaps. Every
   finding fails the analysis, including warning-level review signals. A failed
   analyzer also fails the run; preserve results from checks that completed.
   Pre-existing findings may be labeled but remain blocking.
3. Classify the evidence without confusing a failing gate with proof of a bug:

   | Kind | Evidence | Response |
   | --- | --- | --- |
   | **Fix** | A demonstrated defect or broken runtime contract | Explain the failure and repair it within scope. |
   | **Enforce** | An adopted coding, type, or dependency constraint | Restore the constraint and preserve intentional exceptions. |
   | **Review** | Complexity, reachability, coupling, or other contextual concern | Investigate before deciding whether a refactor or policy adjustment is justified. |

   Tool classifications are starting points. Reclassify when source evidence
   warrants it, and explain why; all findings still block success.
4. Inspect relevant functions using [effects and testability](effects-and-testability.md).
   Keep source observations and agent judgments distinct from analyzer results.
   Report unresolved calls and ownership uncertainty. Local mutation alone does
   not establish impurity; no composite quality score or purity proof is provided.
5. For every supported finding, give its location, classification, evidence,
   consequence, uncertainty, and proposed action. Record complexity scores with
   their thresholds and variants. A metric alone does not justify splitting a
   function. Reachability alone does not justify deleting dynamically used code.
6. When cleanup is requested, make the smallest supported changes and rerun the
   suite. Preserve observable behavior, useful type information, callback order,
   object omission semantics, and mutation ownership. Do not suppress findings,
   weaken thresholds, add unjustified casts, or hide old findings to obtain a pass.
   When only review is requested, report findings without editing source.

Finish with changed behavior, analyzer results, contextual findings, and remaining
coverage gaps. A successful command covers its recorded automated scope; it is
not a claim that contextual review found nothing. Include any additional review
findings in the overall outcome and mark that outcome unsuccessful while they
remain. Runtime validation of a code change is separate work, outside this
skill's static analysis run.

The CLI `review` command prints this guide; the agent performs the review.
