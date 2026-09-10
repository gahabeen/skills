# 510 implement

Build the work described by the selected spec or tickets, verify it, review it,
and commit the resulting change locally on the current branch. An invocation
authorizes this flow without repeating approvals already given. Honor narrower
instructions such as implementing only one slice or leaving changes uncommitted.

Prefer the harness's native editing tools for authored changes, and review the
resulting diff before continuing.

Follow [DOX documentation maintenance](dox.md): read the applicable `AGENTS.md`
chain before editing and update affected contracts and indexes before final
verification and the commit.

## Select the work and preserve the starting state

Use an explicit spec path, ticket reference, or subject after `510 implement`.
Otherwise use the spec already selected in the conversation. To locate a saved
`510 spec`, follow [workflow storage](workflow-storage.md) and search the resolved
`specs` directory, defaulting to `.510/specs/`. Implementation progress notes are
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

## Implement one behavior at a time

Order the work by dependencies and choose small end-to-end slices that satisfy
observable acceptance criteria. Use the bundled [TDD guidance](tdd.md) where a
meaningful behavioral test is possible, at the interfaces agreed in the spec or
already established by repository practice. Read [codebase design](codebase-design.md)
when interface shape or testability needs a design decision.

For each slice, run a test that fails for the intended missing behavior, add the
smallest coherent implementation, and rerun the focused tests. Run typechecking
regularly at meaningful checkpoints. Do not write the whole imagined test suite
before learning from the first working slice. For documentation or similarly
low-impact changes, use relevant existing checks instead of manufacturing tests.

Preserve compatibility and adopted constraints. Keep unrelated cleanup out of the
slice; defer broader refactoring to a demonstrated review finding. Use
[debug](debug.md) when a failure requires investigation. Update progress after
meaningful milestones, retaining failures and blocked checks rather than marking
an incomplete criterion done.

## Verify both the code and the spec

Run the full relevant test suite and repository-required checks at the end. For
JavaScript/TypeScript work, follow the complete [510 review](review.md), including
all static analyzers, contextual findings, and coverage gaps. Runtime tests remain
separate from the static-only `analyze` command. Reuse still-current check results;
rerun affected verification after further edits.

Review the selected change against the captured starting state, including staged,
unstaged, and new files. A committed-HEAD-only diff can miss the implementation.
Keep two assessments distinct:

- **Standards:** check documented repository constraints and the evidence from
  510 review. Investigate unclear naming, repeated knowledge, speculative
  abstractions, and leaking implementation details as contextual signals.
- **Spec:** map every in-scope acceptance criterion to implemented behavior and
  evidence. Identify omissions, incorrect behavior, and unrequested additions.

Perform both passes directly, or delegate separately when available and authorized.
Passing one does not excuse failing the other. Fix supported problems within scope
and repeat affected checks and review. All remaining findings and incomplete
required checks block successful completion and the commit; preserve partial work
and report a blocker that requires access, a decision, or unrelated changes.

## Commit and hand back

When verification and both review assessments pass, follow the bundled
[commit guide](commit.md) with the selected implementation as its scope. Include
its necessary tests and generated files; preserve unrelated work and staging even
when it came from earlier in this thread. Do not force-add ignored progress notes
or external storage. A user request to leave changes uncommitted takes precedence.
Without a Git repository, report that the local commit is unavailable; do not
initialize one just to complete this step. No push, deployment, or external ticket
update is implied by this workflow.

Finish with the behavior delivered, spec and progress paths, verification and
review results, the commit hash when created, and any remaining blocker. Do not
claim the whole spec is complete when the user selected only a slice.

The CLI `implement` command prints this guide; the agent performs the work using
the conversation and repository. All supporting guidance is bundled with 510.

Adapted from Matt Pocock's `implement` and the two-axis `code-review` workflow;
see [source and license](upstream/mattpocock-skills/UPSTREAM.md).
