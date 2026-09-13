# Report work and evidence

Load this guide when delivering edits, review findings, verification, or a handoff.
Lead with the outcome and any limitation that affects it. Keep the result compact
and self-contained. Preserve the user's requested format.

For edits, list changed files with links and a short explanation. Account for new
files, tests, documentation, and generated outputs; exclude unrelated changes.
Group related paths where each remains identifiable.

Report checks as Passed, Failed, Blocked, or Not run. State what the evidence
establishes. Keep runtime tests, builds, and static analysis distinct. Mention
remaining warnings and required gaps rather than hiding them behind test counts.
Reuse existing evidence; do not run extra checks just to fill a section.

Review findings need classification, severity, source location, consequence,
evidence, uncertainty, and an action. Group repeated diagnostics while retaining
every finding ID and location in the linked report. Existing findings still block
analysis success. Report partial comparisons and unreviewed pages explicitly.

List concrete remaining actions and who can resolve a blocker when known.
Link saved specifications, diagnoses, and reports. Include verified commit or PR
identifiers when relevant. A saved artifact is not necessarily committed.

Keep each fact in one place. Use brief labeled sections when useful. Simple
answers may stay in prose. Do not manufacture empty sections, quality scores,
verification results, or additional work.

Adapted from [output guidance](output.md); see
[source and license](upstream/asd-ste100-skill/UPSTREAM.md).
