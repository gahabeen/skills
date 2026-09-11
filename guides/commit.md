# Commit the current thread's changes

Apply the shared [output guidance](output.md) to user-facing replies and authored prose.

Use this workflow when the user asks for **510 commit** or **$510 commit**.
Create one new local commit containing all uncommitted changes attributable to
the current thread, including earlier turns, with a message grounded in the
selected diff. This invocation authorizes staging and committing that work;
choose the message and proceed without a separate approval step. Follow any
explicit scope or message override from the user.

When reached through `510 pr`, commit only outstanding work in that workflow's
selected PR scope. Already-committed work stays in the PR comparison; having
nothing left to commit does not stop the parent PR workflow.

When this guide is reached through `510 implement`, use that workflow's selected
implementation as the scope. Its invocation includes a local commit unless the
user requests otherwise; unrelated work from the same thread remains excluded.

The agent performs this workflow because it has the conversation context. The
CLI commands `510 commit` and `510 guide commit`, MCP `guide` with
`topic: "commit"`, and resource `five-ten://guides/commit` only return these
instructions. They cannot infer thread ownership or create a commit themselves.

## Establish the scope

Read repository instructions and reconstruct the thread's work from its full
available history, including edits, tool results, and any initial working-tree
snapshot. Inspect the current branch, status, staged and unstaged diffs, and
untracked file contents. Use recent commit subjects to learn the repository's
message conventions. Account for additions, deletions, renames, tests, and
generated files required by the thread's changes.

Git status and the index describe changes, not their ownership. A dirty or staged
file is not automatically part of this thread. Compare each candidate file or
hunk with the thread evidence; include all attributable work, even if it was
never staged. Exclude pre-existing edits and other tasks' changes. If history is
incomplete or edits overlap and cannot be separated confidently, finish the
inspection and ask a focused scope question before committing. Do not silently
omit uncertain thread work or replace the scope with everything in the checkout.

If the selected work is already committed or there is nothing left to commit,
report that and stop. An unborn branch can receive an initial commit, but only
with the selected thread work. Unresolved conflicts or an active merge, rebase,
or cherry-pick need resolution before this workflow creates a new commit; do not
continue or abort those operations implicitly.

When merge or rebase conflict resolution is requested, follow
[510 merge conflicts](merge-conflicts.md) before returning to this workflow.
Keep any existing authorization to resolve and continue the operation.

## Prepare exactly that change

Apply the [DOX documentation pass](dox.md) to the selected thread changes before
staging. Update affected contracts and indexes when necessary, include those
attributable edits, and keep this pass scoped to the prospective commit.

Inspect the actual content for accidental credentials and temporary artifacts.
Run checks required by repository instructions and relevant to the selected
change, reusing results from this thread when the checked content is unchanged.
If a required check fails or is incomplete, report it and resolve issues within
scope before committing; do not bypass it. Committing alone does not request a
review or refactor of the repository. If analysis is required, follow the
[analysis guide](analysis.md) and retain its complete coverage contract.

Select explicit paths only when their entire change belongs to the thread. For
shared files, stage only the attributable hunks. Include both sides of renames
and intended deletions. Never use blanket `git add .`, `git add -A`, or
`git commit -a` to approximate thread ownership.

Preserve unrelated staged and unstaged content, including its staging state.
Before changing the index, record enough of its content to verify preservation.
If it already contains unrelated staged work, a plain `git commit` would include
that work: use an explicit path commit for wholly owned files, or an isolated
temporary index for mixed files. With a temporary index, construct the selected
tree from HEAD (an empty tree for an unborn branch), apply only the selected
changes, and use that index for both inspection and the commit. Afterwards,
reconcile only committed hunks in the original index with the new HEAD while
retaining unrelated staged hunks. Do not reset the whole index or stash unrelated
work as a shortcut. If preserving mixed edits cannot be done confidently, ask
about the specific overlap instead of guessing.

Inspect the exact prospective commit diff, not just file names or a diff stat.
Verify it contains every selected change and nothing else, and run Git's
whitespace/error check on that diff. Recheck HEAD and the selected content before
committing; if they changed during preparation, inspect again before proceeding.
Keep temporary patches and message files outside the installed skill and remove
only temporary files created by this workflow.

## Choose the message and commit

Follow an explicit repository commit-message convention. Otherwise use
Conventional Commits: `type(scope): imperative summary`, omitting the scope when
it adds no useful context. Choose the type from the actual outcome, such as
`feat` for a new capability, `fix` for a defect, or `docs` for documentation-only
work. Use `refactor`, `test`, `build`, `ci`, `perf`, or `chore` when those describe
the change more accurately.

Name the concrete result, not the activity of editing files. Aim for a subject
under 72 characters without a trailing period; for example,
`feat(auth): remember the selected sign-in account`. Describe the complete
selected change. Add a short body when the reason, multiple related changes, or
a compatibility impact would be unclear from the subject. Mention breaking
changes explicitly; include issue references only when supported by the thread
or repository. Honor the user's supplied message when present.

Create one new commit using the selected content and message. Pass the message
as an argument without shell interpolation, or use a temporary UTF-8 message
file with `git commit --file`; do not interpolate generated prose into a shell
command. Let repository hooks run. If a hook fails, inspect its result and any
edits, fix only within scope, repeat affected checks, and re-inspect the candidate
before retrying. Stop and report a persistent failure or one requiring unrelated
changes. Check whether a commit was created before retrying after an uncertain
result. Do not amend, skip hooks, change Git identity/configuration, rewrite
history, or push unless the user separately requests it.

Verify the resulting commit's hash, subject, and full diff against the selected
change. Check that unrelated working-tree and index changes are preserved. If
verification reveals a mismatch, report it rather than claiming success or
silently rewriting the commit. Finish with the short hash, subject, checks run,
and any work left uncommitted or blocker.

## Inspiration

Inspired by GitHub's MIT-licensed
[git-commit skill](https://github.com/github/awesome-copilot/blob/main/skills/git-commit/SKILL.md).
These instructions are independently written for 510. They add current-thread
attribution and preservation of unrelated staged changes, prefer repository
message conventions, and execute from the user's invocation without a separate
message-selection approval.
