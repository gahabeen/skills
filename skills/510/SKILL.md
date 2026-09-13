---
name: "510"
disable-model-invocation: true
description: "Explicitly invoke 510 to explain, plan, implement, debug, review, and finish JavaScript/TypeScript project work through bundled workflows and local tools."
---

# 510

One entrypoint for project work. Internal guides are bundled resources, not
additional skills. Load only the current workflow and its current phase.

## Bare invocation

For only `510`, `@510`, `$510`, or help without a task, introduce 510 and offer
these choices in under 150 words. Do this before repository inspection or tools:

- Understand: `510 explain [question]`.
- Plan: `510 explore [idea]`, `510 grill [plan]`, `510 spec [subject]`.
- Build or fix: `510 implement [spec/task]`, `510 debug [symptom]`.
- Improve: `510 review [scope]`, `510 refactor [scope]`.
- Finish: `510 commit`, `510 pr`, `510 merge conflicts`, `510 handoff`.
- Set up: `510 init`.

Close with “Pick a command, or tell me what you want to do.” Otherwise follow
the requested task directly.

## Select one workflow

| Request | Read now |
| --- | --- |
| Explain code or architecture; read-only | [explain](runtime/guides/explain.md) |
| Explore options and retain tentative findings | [explore](runtime/guides/explore.md) |
| Challenge a plan and settle domain decisions | [grill](runtime/guides/grill.md) |
| Synthesize agreed requirements | [spec](runtime/guides/spec.md) |
| Implement selected work, verify, and commit locally | [implement](runtime/guides/implement.md) |
| Reproduce, diagnose, and fix a bug or slowdown | [debug](runtime/guides/debug.md) |
| Assess source and complete static evidence | [review](runtime/guides/review.md) |
| Improve structure while preserving behavior | [refactor](runtime/guides/refactor.md) |
| Commit this task's selected changes | [commit](runtime/guides/commit.md) |
| Push and create/update a draft PR | [pr](runtime/guides/pr.md) |
| Resolve and finish an active merge/rebase | [merge conflicts](runtime/guides/merge-conflicts.md) |
| Save a continuation document | [handoff](runtime/guides/handoff.md) |
| Initialize storage/tooling and project instructions | [toolchain](runtime/guides/toolchain.md) |

Honor narrower requests, including diagnosis-only, discussion-only, or leaving
changes uncommitted. PR invocation authorizes its publication flow, not merging.

## Work within scope

Read applicable repository instructions and inspect the working-tree state.
Preserve unrelated work. Before edits, read the root-to-target `AGENTS.md` chain;
use [DOX](runtime/guides/dox.md) when maintaining affected contracts or indexes.
Use native editing tools and review each coherent diff, including new files.

For changed code, read [coding rules](runtime/guides/coding-rules.md).
Load design, environment, and verification references when their decisions arise.
Do not recursively read every linked guide or reread unchanged instructions.
Before saving workflow notes, resolve MCP `paths` or CLI `paths --root PATH`;
then follow [storage](runtime/guides/workflow-storage.md).

Lead replies with the outcome. Use plain language, preserve uncertainty, cite
evidence, and state remaining work. [Output guidance](runtime/guides/output.md)
is a short shared reference; load detailed reporting only when delivering a work report.

## Retrieve what is needed

MCP `guide` and CLI `guide TOPIC` retrieve the same resources.
Use `phase` / `--phase` for implementation stages and `rule` / `--rule`
with topic `rules` for one diagnostic's explanation. Returned references are
routing information, not a request to load all targets.
Use `profile` for read-only project evidence and applicable environment topics.

The CLI is `bun <skill-directory>/scripts/510.mjs`.
Explain, planning, and guide retrieval need no initialization.
For unavailable tooling, use the toolchain guide and report readiness accurately.
Keep the installed skill read-only; dependencies, caches, and reports use configured storage.

## Preserve evidence

Review and refactor require all six static analyzers. Every finding, including
Review signals, and every required coverage gap blocks analysis success.
Read all findings pages and gaps; completed does not mean successful.
Static analysis never starts application code, tests, builds, or benchmarks.
Run authorized runtime verification separately.

Distinguish demonstrated defects (Fix), adopted constraints (Enforce), and contextual
signals (Review). Complexity alone does not justify refactoring; local mutation
alone does not establish impurity. Comparisons and grouping never suppress findings.
