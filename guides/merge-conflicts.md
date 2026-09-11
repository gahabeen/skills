# 510 merge conflicts

Resolve the current merge or rebase, preserving the intent of the changes being
combined. The invocation authorizes conflict edits, relevant checks, staging the
resolved work, and completing that local operation. Honor narrower instructions,
such as resolving files while leaving the operation unfinished. Keep unrelated
work intact and retain authorization already given in the conversation.

## Establish the operation and its intent

Read repository instructions and inspect Git status, HEAD, the index, unstaged
changes, and untracked files. Identify the active operation and its source and
destination commits. Use Git's own paths for operation state so linked worktrees
are handled correctly. If no merge or rebase is active, report that state without
starting one. An unmerged index alone does not identify the operation.

Record the unmerged paths and enough initial state to distinguish conflict
resolution from unrelated work. Inspect the base and both index stages where
available, surrounding code, commit history, and the relevant tests. Trace the
reasons for each side through commit messages and linked PRs or issues when needed
and accessible. Report missing evidence rather than inventing intent.

During a rebase, Git's ours/theirs labels describe the rebase machinery. Identify
the actual commits before choosing content. Account for renames, deletions, and
binary conflicts, which may have no text markers.

## Resolve and verify

Preserve both intended behaviors where compatible. For incompatible changes,
follow the operation's established goal and explain the tradeoff. Ask about a
material product or ownership choice only when the evidence and user instructions
cannot settle it. Prepare the resolvable work while that choice remains open.

Use the harness's native edits for authored files. Resolve canonical sources
before regenerating derived files or lockfiles with the project's tools. Inspect
the resulting changes, including automatically merged callers and tests where
they interact with the conflict. A marker-free file can still combine incompatible
contracts. Keep the change scoped to reconciliation and resulting regressions.

Discover and run the repository's required checks and focused tests for the
combined behavior. Add a regression test when existing coverage misses a meaningful
interaction. Fix failures introduced by the resolution and retain evidence of
pre-existing failures or unavailable checks. Apply [DOX maintenance](dox.md) to
affected instructions. Static analysis, when required, follows [analysis](analysis.md)
and remains separate from runtime tests. Required failures or gaps block completion.

Stage only verified resolutions and necessary integration fixes using explicit
paths or hunks. Preserve intended deletions. Inspect the full pending commit,
including changes Git merged automatically. Verify that no unmerged index entries
remain and run Git's whitespace/error check on the pending change.

Preserve unrelated staged and unstaged content and its staging state. A merge or
rebase continuation commits the index, so the ordinary commit guide's selective
path recipe is not a substitute. If unrelated staged work cannot be excluded and
preserved confidently, retain the prepared resolutions and ask about that specific
overlap before completing the operation.

If a rebase refuses continuation because of unrelated unstaged edits, inspect the
remaining replay for overlap with those paths. When they are independent, save
their exact content, modes, and index state in a verified temporary backup outside
the worktree. Record the restoration steps and backup path before temporarily
returning only those paths to their indexed content. Restore the saved edits after
completion or interruption and verify their content and staging state. Retain the
backup until restoration is verified. If overlap or preservation is uncertain,
keep the resolutions prepared and ask about that specific conflict. Do not hide
dirty files with assume-unchanged or skip-worktree flags.

## Complete the existing operation

Recheck Git state before continuing. Complete the merge commit or use the active
rebase's continuation mechanism. Let hooks run and inspect any changes they make.
For each further rebase conflict, repeat the intent, resolution, and verification
loop until the existing sequence finishes. Preserve commit intent and planned
ordering. Do not skip a commit or drop an empty one without establishing that its
change is already represented and that this follows the requested rebase plan.

Keep incomplete work resumable. Do not abort, reset, stash unrelated work, bypass
hooks, change Git identity, or push as a shortcut. Follow an explicit user request
to stop or abort, and report an unresolved decision or persistent failure instead
of discarding either side. After an uncertain continuation result, inspect state
before retrying.

Verify the final history and combined behavior, that the operation has ended, and
that unrelated work remains intact. Recheck any contracts changed by later replayed
commits. Return the outcome, resulting commit or HEAD, important resolution choices,
checks actually run, and anything still pending. Follow [output guidance](output.md).

CLI `510 merge conflicts`, `510 guide merge-conflicts`, MCP `guide` with
`topic: "merge-conflicts"`, and resource `five-ten://guides/merge-conflicts` return
these instructions. Retrieval requires no Git repository or toolchain initialization
and performs no Git operation. The agent resolves the actual conflicts.

Adapted from Matt Pocock's `resolving-merge-conflicts`;
see [source and license](upstream/mattpocock-skills/UPSTREAM.md).
