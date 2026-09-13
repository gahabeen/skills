# Clear output and work evidence

Lead with the answer or resulting behavior. Use plain language and consistent
domain terms. Preserve the user's language, requested format, technical meaning,
uncertainty, and exact diagnostics. Scale detail to the task; simple answers need
no work-report template. Keep each fact in one place.

Distinguish observed facts, assumptions, and proposed work. Cite supporting
sources. Preserve code, commands, identifiers, quotations, and structured data
exactly when their spelling matters.

When delivering edits, review, verification, or a handoff:

- Link changed files and saved artifacts, grouping related work. Account for
  necessary tests, documentation, and generated outputs; exclude unrelated changes.
- Report checks as Passed, Failed, Blocked, or Not run. State what they establish.
  Keep static analysis, runtime tests, and builds distinct. Reuse current evidence;
  do not run extra checks merely to fill a report.
- Give review findings a classification, severity, source, consequence, evidence,
  uncertainty, and action. Group repetitions while retaining every finding ID and
  location in the linked report. Disclose unreviewed pages, partial comparisons,
  remaining findings, and required coverage gaps. Existing findings still block
  analysis success; a completed command does not establish success.
- State remaining work and who can resolve blockers when known. Include verified
  commit/PR identifiers when relevant; a saved artifact need not be committed.

When authoring instructions for another agent, use
[writing for agents](writing-for-agents.md). Do not load it for ordinary replies.
Do not manufacture empty sections, quality scores, or verification results.

Adapted from [danyuchn/asd-ste100-skill](https://github.com/danyuchn/asd-ste100-skill).
This is STE-inspired guidance, not certified compliance.
See [source and license](upstream/asd-ste100-skill/UPSTREAM.md).
