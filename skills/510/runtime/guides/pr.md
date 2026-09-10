# Package the current thread's work into a PR

Use this workflow when the user asks for **510 pr** or **$510 pr**, optionally
with **--base BRANCH**. Package the current thread's selected work, including
earlier commits, into a GitHub pull request. The invocation authorizes creating
a feature branch when needed, committing outstanding work, pushing that branch,
and creating a draft PR or updating the matching open PR without repeated
approval prompts. Honor explicit scope, target, readiness, or preview-only
instructions. Merging is a separate action.

The agent performs this workflow using conversation and repository context.
CLI `510 pr [--base BRANCH]` prints these instructions and any supplied base;
it does not resolve Git state or publish anything. CLI `510 guide pr`, MCP
`guide` with `topic: "pr"`, and resource `five-ten://guides/pr` return the same
guide. Reading it needs no initialization or hosting credentials.

## Resolve the destination and scope

Read repository instructions and reconstruct the selected work from the full
available thread history. Inspect the current branch, HEAD, staged and unstaged
diffs, untracked files, and earlier commits. Use the [commit guide](commit.md)
for change attribution and preserving unrelated work and its staging state.
A clean checkout or nothing left to commit does not mean there is no PR to open.

Identify the destination repository and host, the head repository, and the push
remote from the user's instructions and actual Git/hosting configuration. Check
the available GitHub connector or `gh` authentication and repository access.
Do not assume `origin` is the destination: a fork can supply the head while the
upstream repository receives the PR. Resolve an existing open PR by destination
repository and exact head repository/branch, not by branch name alone. Read its
base, title, body, and draft status before deciding what to update.

Resolve the base in this order:

1. Explicit `--base` or a target already agreed in the conversation; the current
   explicit choice takes precedence over an earlier choice.
2. The matching existing PR's base.
3. The repository's configured PR base, including GitHub CLI's
   `branch.<current>.gh-merge-base` setting.
4. The destination repository's default branch.

The base is the branch receiving the PR, not the head branch's tracking upstream.
Verify it exists in the destination repository and refresh the relevant remote
refs before inspecting the comparison. An explicit or configured base that does
not exist is an error, not permission to fall back to the default. A stacked PR
may target another feature branch; do not replace it with the default branch.
If destination, base, or ownership is still ambiguous, finish independent
preparation and ask one focused question rather than guessing.

Inspect both the commits ahead of the base and the full PR diff from the merge
base to the proposed head. Account for uncommitted selected changes as well.
Every included commit and changed hunk must belong to the selected work or be an
agreed dependency. Unrelated changes can hide in earlier commits even when the
latest commit is correctly scoped. Do not use the base-to-HEAD diff as evidence
of thread ownership. If history is incomplete or mixed work cannot be separated
confidently, resolve the specific scope uncertainty before committing or pushing.

## Prepare the head and verify the change

Reuse a suitable feature branch when its complete PR comparison matches the
scope. When on the default/base branch or a detached HEAD, create a descriptively
named feature branch following repository conventions. If a branch includes
unrelated commits, prepare an isolated branch/worktree from the resolved base
with only the attributable commits or hunks, provided their dependencies are
understood. Preserve the original branch, checkout, index, and unrelated edits;
do not reset, stash, rewrite history, or retarget the PR merely to hide extra work.
Unresolved conflicts or an active merge, rebase, or cherry-pick must be resolved
explicitly before proceeding. Do not initialize a repository or create a remote
fork as an implicit repair for a missing destination.

Follow the [commit guide](commit.md) for outstanding selected work, including
the scoped documentation pass and required checks. Its local-only restriction
does not block the push explicitly authorized by this PR workflow. If all work
is committed, still run required checks or reuse evidence only when it covers
the exact proposed content. Verify an isolated branch in its own checkout so
results do not depend on unrelated files left in the original checkout.
Required checks that fail or remain incomplete block publishing; draft status
does not bypass them. PR packaging alone does not request a repository-wide
review or refactor.

After hooks and any generated updates, inspect the complete prospective PR
diff and commit list again, including Git's whitespace/error check. Confirm the
comparison includes all selected work and no unrelated content or accidental
credentials or temporary artifacts. If there is no remaining difference from
the base, report that instead of creating an empty PR. Recheck the base and head
before publication; if they changed, reassess the comparison and affected checks.

## Write and publish the PR

Use the repository's PR template and title conventions. Write the description
from the complete final diff: lead with the problem and resulting behavior, then
relevant implementation details, actual validation, and material limitations.
Scale detail to the change. Include issue references only when supported by the
thread; use closing keywords only for issues this change actually resolves.
Do not invent checks, screenshots, or results to fill a template.

For an existing PR, update its title/body to reflect the final scope while
preserving useful human-authored context and unrelated metadata. Preserve its
draft/ready status unless the user requests a change. Retarget only when the
user explicitly selects a different base, and inspect that new comparison first.
Create new PRs as drafts unless the user asks for a ready PR. Do not add reviewers,
assignees, labels, milestones, or projects without a request or an applicable
repository convention.

Prepare the exact title and body before publishing. Use structured connector
arguments, or write a UTF-8 body file in the OS temporary directory and pass it
with `gh pr create --body-file` or `gh pr edit --body-file`. Pass generated text
without shell interpolation. For preview-only requests, return the prepared
comparison and description without pushing or creating/editing a PR; do not
use `gh pr create --dry-run`, which can still push.

Push only the verified head to the resolved remote and branch with an explicit
refspec; never force-push or push the base branch. With GitHub CLI, provide
`--repo`, `--base`, `--head`, `--title`, `--body-file`, and `--draft` for a new
draft PR, using the actual repository/host and fork head when applicable.
An explicit head prevents implicit push/fork prompts. Recheck for a matching
open PR immediately before creating one, and update it instead of duplicating it.

If a push is rejected or access is unavailable, retain the prepared work and
report the specific blocker; do not change credentials, permissions, or Git
configuration to get past it. After an uncertain push/create/edit result, inspect
remote state before retrying. A failed command can still have created the PR.
Do not repeat a mutation until its outcome is known. Clean up only temporary
files created by this workflow.

Read back the resulting PR and verify the destination, base, head commit, diff,
title/body, and draft status. Confirm unrelated local work remains intact. Return
the PR URL, base/head branches, checks actually run, and any remaining limitation.
Distinguish successful publication from pending or failing remote CI; opening a
PR does not prove CI passed or request merging it.

## Inspiration

Informed by [Aspire's create-pr skill](https://github.com/microsoft/aspire/blob/main/.agents/skills/create-pr/SKILL.md)
for template-aware descriptions and existing PR handling, and
[dceoy's commit-push-pr skill](https://github.com/dceoy/ai-coding-agent-skills/blob/main/skills/commit-push-pr/SKILL.md)
for the branch/commit/push flow. These instructions are independently written
for 510's current-thread scope, already-committed work, and draft default.
GitHub-specific options and base configuration follow the
[GitHub CLI manual](https://cli.github.com/manual/gh_pr_create).
