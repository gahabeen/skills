# Select the work and preserve the starting state

Use an explicit spec path, ticket reference, or subject after `510 implement`.
Otherwise use the spec already selected in the conversation. To locate a saved
`510 spec`, follow [workflow storage](workflow-storage.md) and search the resolved
`specs` directory, defaulting to `.fiveten/specs/`. Implementation progress notes are
not specs. Match the requested work; do not silently choose the newest file when
several candidates fit. Ask for the source when none is available or the target
remains ambiguous; do not invent a spec to start coding.

Read the complete spec and relevant linked decisions, ticket dependencies,
repository instructions, and current code. Reuse agreed scope and test interfaces.
Distinguish accepted requirements from unresolved proposals. Resolve facts in code
yourself; ask about a missing decision only when it affects the implementation,
continuing independent authorized slices while the answer is pending. Do not
silently replace a draft's unanswered product choices with your preferences.

Capture the current branch, HEAD when it exists, and initial staged, unstaged,
and untracked state before editing. Keep enough baseline evidence to distinguish
this implementation from pre-existing work, including on an unborn branch. On
resumption, inspect actual code and prior verification before deciding what remains.

Keep a concise `<subject>.implementation.md` in the resolved `specs` directory.
Reference the exact source spec/tickets and record acceptance criteria, completed
slices, checks actually run, unresolved findings, and the next step. Reuse that
note for the same work; preserve a colliding note belonging to another task. Keep
progress separate from requirements and do not rewrite the spec to hide a mismatch.


Next load [build](implement-build.md) when requirements and scope are established.
