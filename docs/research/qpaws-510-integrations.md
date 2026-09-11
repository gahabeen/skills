# Generic skills from Qpaws worth integrating into 510

2026-09-11. Revised scope: reusable skills and capabilities from Qpaws's installed
skill collection. Qpaws-specific checks and framework/platform integrations are
outside this recommendation. This replaces the earlier, broader project-tooling
assessment. The assessment below records the state before implementation.

## Approved follow-up

The user selected Fallow, `510 explain`, and output guidance adapted from
[danyuchn/asd-ste100-skill](https://github.com/danyuchn/asd-ste100-skill).
The implementation adds pinned Fallow 3.24.1 duplicate detection to the complete
suite, retaining existing analyzers. It checks discovery and parsing, compares
only selected files, and retains partial findings on failure. Usage traces,
entry discovery, and churn rankings remain outside this integration.

The new [explain workflow](../../guides/explain.md) is read-only and needs no
initialization. The shared [output guide](../../guides/output.md) applies to
returned prose, preserving meaning and evidence. Upstream attribution and the
MIT license travel with the bundle. The original shortlist follows for context.

## Recommendation

Prioritize **Fallow**, then a lightweight **zoom-out/explain** workflow.
Consider a short **unslop** writing pass within existing workflows. Most other
generic skills in Qpaws already overlap substantially with 510.

| Installed skill | Decision | Useful delta for 510 |
| --- | --- | --- |
| Fallow | Integrate its capability and adapt its guidance | Clone detection, usage traces, entrypoint discovery, and graph/churn context for refactoring. Potential analyzer consolidation requires separate evidence. |
| zoom-out | Add a small explain workflow | A read-only map of modules and callers using the project's domain vocabulary, without requiring a bug, spec, or refactor. |
| unslop | Fold selected guidance into report/PR/handoff writing | Remove filler, vague claims, repeated summaries, promotional language, and dense sentences while preserving evidence and uncertainty. |
| softeng-review | Selective reference; no separate workflow | Its generic ownership, boundary, and testability concerns are mostly already in review and codebase-design. |
| diagnose | Already covered | 510 debug already has reproduction, hypothesis testing, instrumentation, regression tests, and performance evidence. |
| grill-me / grill-with-docs | Already covered | 510 grill combines grilling with domain terminology and decision records. |
| handoff | Already covered | 510 handoff preserves continuation context and references existing artifacts. |
| karpathy-guidelines | Already covered | Scoped changes, explicit assumptions, simple implementation, and verifiable outcomes are already present. |
| caveman | Leave as a personal preference | A terse voice mode does not add an engineering capability; normal concise writing belongs in the output guidance. |

Sources below are the actual installed skill instructions, treated as material to
evaluate rather than as instructions to execute during this assessment.

## Fallow is the substantive tooling addition

The installed [Fallow skill](/Users/gabindesserprit/Code/qpaws-next/.agents/skills/fallow/SKILL.md)
covers unused-code investigations, clone detection, project/entrypoint discovery,
usage traces, and refactoring context. 510 already has unused-code, dependency
graph, and complexity checks, but lacks a clone detector and a unified guided
investigation of these results. See the [current suite](../../guides/analysis.md)
and [review workflow](../../guides/review.md).

Transfer a workflow that discovers actual entries and graph scope, collects
structured evidence, follows usage traces before proposing deletion, reviews
duplicate groups in context, and verifies an authorized cleanup. Keep the tool
version pinned in 510's isolated toolchain and keep all runtime data in configured
storage. Integrate it within the explicitly invoked 510 skill rather than adding
a competing implicitly invoked skill.

Do not copy the installed skill verbatim. Its Agent Rules explicitly prescribe
discarding stderr with `2>/dev/null` and appending `|| true`. These hide diagnostic
and exit-status evidence that 510 must retain. Its broad automatic triggers and
blanket suppression advice also need adaptation to 510's explicit invocation and
complete-coverage policy. Tool output is evidence; it does not determine 510's
classification or final success.

Keep Knip, SonarJS, and dependency-cruiser until findings, metric semantics,
configuration behavior, and declared boundary rules have been compared.
The external [Fallow documentation](https://github.com/fallow-rs/fallow) and
[release history](https://github.com/fallow-rs/fallow/releases) describe a rapidly
changing tool; recommendations must target a tested version.

A prior read-only smoke run of Qpaws's installed Fallow 2.102.0 reported 990 clone
groups across 2,372 files using default discovery. This is evidence that the tool
can produce useful additional review material, not a count of confirmed defects.
The health run warned about skipped script entrypoints despite exiting zero.
Raw temporary reports:
[duplication](/private/tmp/510-qpaws-dupes.json) and
[health](/private/tmp/510-qpaws-health.json).
These are illustrative integration observations, not a request to encode Qpaws's
particular configuration into 510.

## Zoom-out is a small missing workflow

The installed [zoom-out skill](/Users/gabindesserprit/Code/qpaws-next/.agents/skills/zoom-out/SKILL.md)
asks for a higher-level map of relevant modules and callers using the domain
glossary. 510's [design guidance](../../guides/codebase-design.md) uses this
reasoning during changes, but the current public workflows do not offer a
dedicated orientation task.

A proposed `510 explain <area>` could report purpose, owning modules, public
interfaces, callers, one representative data/control flow, and useful next files
to read. Cite inspected code and label unknown edges. It should remain read-only
and work without initializing the static toolchain. The workflow name is a
proposal, not an existing command.

## Unslop is supporting guidance

The installed [unslop skill](/Users/gabindesserprit/Code/qpaws-next/.agents/skills/unslop/SKILL.md)
contains reusable advice for clearer explanations and documents. Transfer a short
editing pass into [PR](../../guides/pr.md), [review](../../guides/review.md), and
[handoff](../../guides/handoff.md) guidance. Preserve technical precision and
necessary qualifications. Its exhaustive vocabulary bans and personality
directions are not needed as engineering gates or as another public workflow.

## Avoid duplicating what 510 already owns

[softeng-review](/Users/gabindesserprit/Code/qpaws-next/.agents/skills/softeng-review/SKILL.md)
is largely covered by [codebase-design](../../guides/codebase-design.md),
[effects/testability](../../guides/effects-and-testability.md), and
[review](../../guides/review.md). Source-of-truth contracts, meaningful interfaces,
boundary validation, and behavior-focused tests are already explicit there.
Its mobile/offline/schema-specific judgments should not become universal rules.

[grill-with-docs](/Users/gabindesserprit/Code/qpaws-next/.agents/skills/grill-with-docs/SKILL.md)
is already credited in [grill](../../guides/grill.md).
[diagnose](/Users/gabindesserprit/Code/qpaws-next/.agents/skills/diagnose/SKILL.md)
and [handoff](/Users/gabindesserprit/Code/qpaws-next/.agents/skills/handoff/SKILL.md)
substantially overlap [debug](../../guides/debug.md) and [handoff](../../guides/handoff.md).
[Karpathy guidelines](/Users/gabindesserprit/Code/qpaws-next/.agents/skills/karpathy-guidelines/SKILL.md)
overlap the scope and verification discipline in [implement](../../guides/implement.md).

React Doctor is reusable within React projects, but it belongs to the
framework-specific category excluded by this clarification. Qpaws's schema,
native tracking, patch policies, and performance harnesses are likewise excluded
from this shortlist.

## Validation before implementation

At the assessment stage, only this research note was added and revised; Qpaws
and 510 runtime sources were unchanged. Local links and the authored diff were checked. The earlier full
repository check passed rule/install/analysis/runtime tests but failed two MCP
search tests under sandbox permissions. A rerun cleared those search errors but
timed out in a separate MCP test. Type, skill metadata, and bundle checks passed
separately; lint reported eight existing warnings. No full successful check or
implemented integration is claimed.
