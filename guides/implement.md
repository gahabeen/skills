# 510 implement

Build the selected requirements, verify behavior and standards, and commit locally
unless the user requests otherwise. Preserve unrelated work and staging. No push,
deployment, or external ticket update is implied.

This document contains the complete workflow. Use its sections as needed;
MCP `guide {topic: "implement", phase: "build"}` or CLI
`guide implement --phase build` can retrieve one section when resuming.

## Select work

Use the selected spec, tickets, or clear requirements established in the
conversation. A formal spec is optional. Read an explicitly selected source and
relevant decisions completely; distinguish accepted requirements from open
proposals. Use [workflow storage](workflow-storage.md) only when locating a saved
spec or keeping progress. Do not silently choose the newest of several candidates
or invent requirements. Ask about ambiguity that affects the result, resolve facts
in code yourself, and progress independent work while consequential decisions remain open.

Capture branch, HEAD if present, and staged, unstaged, and untracked changes before
editing. On resumption, inspect the actual implementation and prior verification.

For work expected to span sessions or multiple dependent slices, keep a concise
`<subject>.implementation.md` in the resolved specs directory. Reference the
requirements, completed work, actual checks, findings, and next step. A small
self-contained task needs no spec or progress file. Reuse existing notes when
resuming; preserve other tasks' notes and never rewrite requirements to conceal a mismatch.

## Build behavior

Implement small end-to-end behaviors at the agreed interfaces. Use [TDD](tdd.md)
where a meaningful behavioral test is possible: establish the intended failure,
implement the behavior, then rerun focused tests. Typecheck at useful checkpoints.
Documentation and low-impact changes use relevant existing checks.

Apply [coding rules](coding-rules.md). Load [design](codebase-design.md) for interface
or testability decisions, [environment](environment.md) when runtime or packaging
affects implementation or verification, and [debug](debug.md) for failures needing
investigation. Maintain affected documentation; use [DOX](dox.md) when instructions
or their hierarchy change. Preserve compatibility and adopted constraints.
Update progress at meaningful milestones, retaining failed or blocked checks.

## Verify code and requirements

Run the full relevant test suite and repository-required checks. For JavaScript/
TypeScript work, complete [510 review](review.md) within the selected scope,
including all six static analyzers, contextual assessment, and coverage gaps.
Runtime verification is separate from static analysis. Reuse current results;
rerun affected checks after further edits.

Review the complete selected change against its starting state, including staged,
unstaged, and new files. Assess both:

- **Standards:** repository constraints, coding rules, and supported review findings.
- **Spec:** evidence for every in-scope acceptance criterion, omissions, incorrect
  behavior, and unrequested additions.

Perform both assessments directly or delegate when available and authorized.
Fix supported problems within scope and repeat affected checks. Every remaining
finding and incomplete required check blocks successful completion and committing.
Retain partial work and identify blockers needing access, decisions, or unrelated changes.

## Finish locally

After required checks and both assessments pass, use [commit](commit.md) with
this implementation as its scope, including necessary tests and generated files.
Honor leave-uncommitted requests. Preserve unrelated staging and do not force-add
ignored notes or external storage. Without a Git repository, report the unavailable
commit rather than initializing one.

Use [output guidance](output.md) to report the delivered behavior, spec/progress
paths when present, verification and review results, commit hash when created,
and remaining work. Claim completion only for the selected scope.

Adapted from Matt Pocock's implementation and review workflows;
see [source and license](upstream/mattpocock-skills/UPSTREAM.md).
