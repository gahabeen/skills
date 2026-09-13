---
name: "510"
disable-model-invocation: true
description: "Guide JavaScript/TypeScript project work with bundled workflows and local tools. Use only when the user explicitly invokes 510."
---

# 510

Select the requested workflow. Read supporting guides only when their stated
condition applies; reuse unchanged instructions already in context.

For bare `510`, `@510`, `$510`, or help without a task, offer the choices below
in under 150 words before repository inspection or tools. Invite the user to
pick a command or describe their task.

| Command | Purpose and guide |
| --- | --- |
| `explain` | [Explain source or architecture, read-only](runtime/guides/explain.md) |
| `explore` | [Investigate options and retain tentative findings](runtime/guides/explore.md) |
| `grill` | [Challenge a plan and record agreed decisions](runtime/guides/grill.md) |
| `spec` | [Write agreed requirements](runtime/guides/spec.md) |
| `implement` | [Build, verify, and commit selected work locally](runtime/guides/implement.md) |
| `debug` | [Reproduce, diagnose, and fix a bug or slowdown](runtime/guides/debug.md) |
| `review` | [Assess source and complete static evidence](runtime/guides/review.md) |
| `refactor` | [Improve structure while preserving behavior](runtime/guides/refactor.md) |
| `commit` | [Commit this task's selected changes](runtime/guides/commit.md) |
| `pr` | [Push and create/update a draft PR](runtime/guides/pr.md) |
| `merge conflicts` | [Resolve and finish an active merge/rebase](runtime/guides/merge-conflicts.md) |
| `handoff` | [Save a continuation document](runtime/guides/handoff.md) |
| `init` | [Initialize storage, tooling, and project instructions](runtime/guides/toolchain.md) |

## Shared contract

Honor the user's scope and existing authorization, including diagnosis-only,
discussion-only, partial work, or leaving changes uncommitted. PR invocation
authorizes publication, not merging.

Follow applicable repository instructions and inspect the working-tree state.
Before edits, read the applicable root-to-target `AGENTS.md` chain. Preserve
unrelated work and staging. Use native editing tools and review the resulting diff.
Maintain affected documented contracts; load [DOX](runtime/guides/dox.md) when
project instructions or their hierarchy need work.

Apply [coding rules](runtime/guides/coding-rules.md) to changed code.
Use [output guidance](runtime/guides/output.md) for replies and work evidence.
Before saving workflow notes, resolve MCP `paths` or CLI `paths --root PATH`
and follow [storage](runtime/guides/workflow-storage.md).

## Tool access

The CLI is `bun <skill-directory>/scripts/510.mjs`. MCP `guide` and CLI
`guide TOPIC` retrieve the same resources. Implementation `phase` / `--phase`
and diagnostic `rule` / `--rule` remain available for selective retrieval.
Returned links do not request recursive reading.

Explain, planning, and guide retrieval need no initialization. Use `profile`
when package evidence is needed, and [toolchain](runtime/guides/toolchain.md)
when tooling is unavailable. Keep the installed skill read-only; dependencies,
caches, and reports belong in configured storage.
