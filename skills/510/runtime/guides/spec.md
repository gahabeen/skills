# 510 spec

Apply the shared [output guidance](output.md) to user-facing replies and authored prose.

Turn the current conversation and repository evidence into an actionable written
specification. Use text after `510 spec` as the focus. Reuse a selected
[exploration](explore.md), the outcomes of a prior grill, existing requirements,
the project's glossary, and relevant decision records. Reference the exploration
and carry forward its open questions without promoting tentative options into
requirements. Synthesize what is known; do not restart the interview.

## Establish the contract

Inspect the current implementation enough to describe the problem and the proposed
behavior accurately. Read [codebase design](codebase-design.md) when choosing
module interfaces and where to test them. Prefer existing interfaces that exercise
the real behavior, including observable effects and failure cases. Describe the
contract callers need, not just type signatures or a list of files to edit.

Separate accepted decisions from recommendations, assumptions, and open questions.
Do not invent requirements or silently decide a tradeoff the conversation left
open. Produce a useful draft when decisions are missing, naming which ones block
implementation. Ask only for a missing decision that materially prevents a useful
spec; do not ask for facts available in code or reopen settled choices.

## Write the specification

Scale the detail to the change. Use the project's existing spec template when one
exists; otherwise cover:

- **Problem and outcome:** who encounters the problem, a concrete example, and
  what should happen after the change.
- **Scope and acceptance criteria:** observable success cases, relevant failures
  and edge cases, and explicit exclusions. Use user stories when they clarify
  distinct needs; do not pad the document with repetitive stories.
- **Design decisions:** responsibilities, interfaces, ownership, dependencies,
  ordering, error behavior, and compatibility or migration requirements.
- **Verification:** where each acceptance criterion will be exercised, existing
  test examples worth following, and any required integration or runtime checks.
- **Open decisions and risks:** distinguish blockers from deliberately deferred
  work. Mark the spec as a draft if unresolved choices prevent implementation.
- **References:** relevant glossary/ADR entries, issues, prototypes, and evidence.

Prefer stable conceptual descriptions over a brittle inventory of paths. Link
to existing artifacts when useful; include a small schema, state machine, or code
sketch only when it captures an agreed decision more precisely than prose. Do not
describe proposed checks as if they have already passed.

## Save and hand back

Follow [workflow storage](workflow-storage.md). Save under the resolved `specs`
directory, defaulting to `.fiveten/specs/<subject>.md`, or update the spec explicitly
selected by the user. This destination is already authorized; do not ask again
merely to save the file. Reuse configured shared/custom storage without changing it.

Read the saved document back for agreement with the conversation. Return its
absolute path, readiness for implementation, and the decisions still needed.
Creating a spec alone does not publish an issue or start implementation. If those
actions were also requested, carry forward that authorization and continue once
their prerequisites are met. Continue with [510 implement](implement.md) when
implementation is requested, passing the saved spec path. No issue tracker or
upstream setup skill is required.

Adapted from Matt Pocock's `to-spec`; see [source and license](upstream/mattpocock-skills/UPSTREAM.md).
