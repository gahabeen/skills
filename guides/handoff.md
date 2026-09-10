# 510 handoff

Write a continuation document for a fresh agent using the current conversation
and the actual work state. Treat anything after `510 handoff` as the next
session's focus. If no focus was given, use the current unfinished objective.

## Preserve what the next agent needs

Keep the document compact and actionable:

- The objective, requested next focus, and what completion means.
- User decisions, constraints, preferences, and existing authorization boundaries.
- Completed work and work in progress, including relevant repository, branch,
  commit, and uncommitted state when available. Distinguish this session's edits
  from pre-existing changes; say when ownership is uncertain.
- Remaining steps, blockers, open questions, and failed approaches worth avoiding.
- Verification actually performed, its results, and checks still required. For
  510 analysis, preserve report paths, findings, coverage gaps, and the difference
  between a completed run and a successful one. Do not run new analysis merely
  to fill this section.
- A **Suggested skills** section naming available skills and the task each would
  help with. Prefer the relevant explicit `510` workflow when appropriate; do not
  assume the next agent has sibling skills or a particular Skill tool.

Reference existing specs, plans, glossary entries, decision records, issues,
commits, reports, and diffs by usable path or URL instead of repeating them.
Capture essential context that exists only in the conversation. Separate known
facts from assumptions; do not turn a proposal into an agreed decision.

Remove credentials, secrets, and sensitive personal information from the handoff.
Keep any necessary credential references as locations or variable names only.

## Save and return

Use the user's requested destination when provided. Otherwise create a uniquely
named Markdown file in the OS temporary directory, such as
`510-handoff-<unique-id>.md`. Do not overwrite an earlier handoff. The default
destination is outside the current workspace and the installed skill; discover
the OS temporary directory rather than assuming a platform-specific path.

Read the saved document back to check its accuracy, then return its absolute path
and a short prompt the user can give the next agent to read it and continue.
Note which referenced local files would also be needed if the next session runs
on another machine. Creating this document does not transfer a task or start
another agent.

Adapted from Matt Pocock's `handoff`; see [source and license](upstream/mattpocock-skills/UPSTREAM.md).
