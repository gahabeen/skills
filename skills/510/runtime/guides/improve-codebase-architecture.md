# Find useful architecture improvements

Use this internal guide when `510 explore`, `510 review`, or `510 refactor` needs
to identify and compare structural improvements. Read [codebase design](codebase-design.md)
for the shared vocabulary and test seams. Reuse the project's domain terms and
relevant architecture decisions. The calling workflow owns scope, storage,
verification, and authorization.

## Find evidence of friction

Honor a selected module, subsystem, or pain point. Within that scope, use recent
commit history to prioritize areas that repeatedly change. Widen the investigation
when history is sparse or changes are scattered. This prioritization does not
narrow a whole-repository review or replace its coverage requirements.

Follow real callers and representative behavior. Look for knowledge spread across
many modules, interfaces that expose their implementation details, coupled modules
that must change together, or tests that miss the interaction where failures occur.
For a suspected shallow module, ask what deleting it would force its callers to
learn or reimplement. Identify the complexity a proposed consolidation would own.

Support candidates with source and caller evidence. Churn, size, complexity scores,
and test counts are investigation signals. They do not establish a defect or
justify a refactor by themselves. Account for useful abstractions and existing
decisions that explain the current design.

## Compare concrete candidates

For each useful candidate, show the affected files, observed friction, proposed
responsibility change, and the practical effect on callers and tests. Explain
what knowledge becomes local, what the interface hides, and which regression or
adapter tests remain necessary. Include costs, migration constraints, uncertainty,
and any architecture decision the proposal would reopen.

Use a before/after diagram when it makes the change easier to assess. Label the
current state as observed and the alternative as proposed. Rank evidence-backed
options as strong, worth exploring, or speculative, with reasons. Recommendation
strength is separate from 510's Fix, Enforce, or Review classification. Keep
unsupported possibilities as open exploration questions, not asserted findings.
Recommend a first candidate only when the evidence supports one. An empty candidate
list is preferable to invented architectural work.

Default to the calling workflow's output format. When a visual comparison would
help or the user requests a report, create one self-contained HTML file in the
OS temporary directory, using a unique name. Honor an explicit destination. Keep
the report usable offline with embedded styles and SVG or HTML diagrams. Show
the scope, evidence, candidate comparisons, decision conflicts, and recommendation.
Inspect the rendered report when preview tools are available and return its
absolute path. Report unavailable visual verification. Link any saved exploration
or spec rather than duplicating it. A visual report does not replace review findings
or analysis evidence.

## Develop the selected direction

Reuse a candidate already selected by the user. If several materially different
directions remain, present the tradeoffs and obtain the choice needed for further
design. Do not reopen an agreed direction. Follow [explore](explore.md) for open
questions or [grill](grill.md) when the user wants to challenge a proposed plan.
Use the alternative-interface guidance in [codebase design](codebase-design.md)
when interface shape needs investigation.

Keep agreed terminology and significant decisions through [domain modeling](domain-modeling.md)
only when the calling workflow authorizes those documents. A review reports proposed
documentation changes without making them. Carry accepted outcomes into [spec](spec.md)
or continue an already-authorized [refactor](refactor.md). Preserve distinct behavior
coverage when consolidating tests. Candidate discovery alone does not authorize
implementation, and none of these transitions is mandatory.

Adapted from Matt Pocock's `improve-codebase-architecture` and `HTML-REPORT.md`;
see [source and license](upstream/mattpocock-skills/UPSTREAM.md).
