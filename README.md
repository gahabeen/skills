# skills

personal skills for real prod projects, by [@gahabeen](https://github.com/gahabeen).

i'm a software engineer. these are the skills i use day to day with coding agents
to think through ideas, build features, debug problems, and review production code.
they reflect how i work; take what helps and adapt it to your own projects.

## what's here

the workflows currently come together in one skill: **[510](skills/510/SKILL.md)**.

### from idea to draft PR

```text
(explain) → (explore) → (grill) → [spec] → [implement] → (commit) → (pr)
```

an existing spec or tickets can take you straight to `implement`.

| step | when i want to… | i use… |
| --- | --- | --- |
| **1 · understand** | understand an area of code and how it fits together | [`510 explain`](guides/explain.md) |
| **2 · explore** | compare options and keep notes to resume later | [`510 explore`](guides/explore.md) |
| **3 · challenge** | think through a plan and challenge the assumptions | [`510 grill`](guides/grill.md) |
| **4 · specify** | turn the agreed direction into a clear spec | [`510 spec`](guides/spec.md) |
| **5 · build** | implement the spec, test and review the changes, and commit locally | [`510 implement`](guides/implement.md) |
| **6 · commit** | commit the current conversation's changes locally | [`510 commit`](guides/commit.md) |
| **7 · share** | package the work into a draft pull request | [`510 pr`](guides/pr.md) |

`implement` and `pr` already include the commit step.

### other workflows

| flow | i use… |
| --- | --- |
| **improve existing code** | [`[review]`](guides/review.md) → `[select priorities]` → [`[refactor]`](guides/refactor.md) → [`[review]`](guides/review.md) |
| **fix a bug** | [`[debug]`](guides/debug.md) → ([`commit`](guides/commit.md) or [`pr`](guides/pr.md)) |
| **resolve conflicts** | [`[merge conflicts]`](guides/merge-conflicts.md) → `[resume workflow]` |
| **continue next session** | `[any stage]` → [`[handoff]`](guides/handoff.md) → `[resume next session]` |

## get started

install with Bun **1.4.2**:

```sh
bunx --bun skills add https://github.com/gahabeen/skills --skill 510
```

invoke `$510` explicitly in your coding agent, then ask for the workflow you need.
it only runs when you ask for it.

ask for **510 init** in your project first. it prepares code search and automated
checks, and the agent creates or refreshes a hierarchy of `AGENTS.md` files with
project-wide rules at the root and local contracts where they belong. later 510
edits keep the affected instructions and indexes current.

tooling files go in the project's `.510/` directory by default, reusing any storage
location you've already chosen. `AGENTS.md` files live alongside the source they
describe. explanations, planning, and handoff don't need initialization.

then choose a workflow, for example:

```text
$510 explain how checkout works
$510 explore could checkout work offline?
$510 grill this plan for order cancellation
$510 spec order cancellation
$510 implement .510/specs/order-cancellation.md
$510 review
$510 review packages/billing
$510 merge conflicts
$510 commit
$510 pr --base main
```

`510 review` assesses the whole repository. add a path to focus on one area.
it combines automated checks with source review of architecture, behavior coverage
in tests, and documentation. it reports exclusions, gaps, and priorities without
editing source. tests and builds are not run by default.

`510 doctor` checks the 510 installation and search readiness.

`510 pr` can infer the base from an existing PR, repository configuration, or the
destination's default branch. use `--base` for an explicit target, including a
feature branch for a stacked PR. it checks the full comparison, commits remaining
work, pushes, and opens a draft PR or updates the matching one.

`510 merge conflicts` resolves an existing merge or rebase, verifies the combined
behavior, and completes the local operation. It preserves unrelated work. Ask to
leave the operation unfinished when you only want the files resolved.

`510 explore` keeps a resumable document in `.510/explorations/<subject>.md` by
default, reusing shared or custom storage when configured. It compares possibilities
and separates findings, tentative ideas, and agreed decisions. Ask for discussion
only to keep the exploration in the conversation. Continue with `grill` or `spec`
when useful; neither is a required next step.

see [initialization and storage](guides/toolchain.md) for manual commands, other storage
locations, and connecting the local tools to your agent.

## what stays with the project

510 keeps shared project knowledge close to the code and saves work in progress
so another session can continue it. each record has a specific purpose. workflows
reuse existing locations and formats, create documents only when there is useful
content to save, and link related records instead of copying them.

| record | default home | when it is created or updated |
| --- | --- | --- |
| [project instructions (DOX)](guides/dox.md) | root and scoped `AGENTS.md` files | `init` establishes project rules, ownership, local contracts, and child indexes; later edits maintain the affected boundaries. |
| [domain glossary](guides/domain-modeling.md) | `CONTEXT.md` | `grill` records agreed domain terms as they are resolved. definitions stay about domain meaning; plans and progress have their own documents. |
| [architecture decision records](guides/domain-modeling.md#record-consequential-decisions-sparingly) | `docs/adr/` | record a settled choice when it is costly to reverse, surprising without context, and the result of a real tradeoff. preserve the rationale when superseding it. |
| [exploration notes](guides/workflow-storage.md) | `.510/explorations/<subject>.md` | `explore` keeps findings, options, tentative direction, and open questions in one resumable document, unless discussion only was requested. |
| [specifications](guides/spec.md) | `.510/specs/<subject>.md` | `spec` captures requirements and acceptance criteria, marking assumptions and unresolved decisions clearly. |
| [implementation progress](guides/implement.md) | `.510/specs/<subject>.implementation.md` | `implement` links the source spec or tickets and records completed work, actual checks, blockers, and the next step. |
| [debugging evidence](guides/debug.md) | `.510/debug/<subject>-<unique-id>/diagnosis.md` | `debug` records reproduction, hypotheses, evidence, cause, fix, and remaining checks; save minimal fixtures or redacted logs when needed. |
| [analysis reports](guides/analysis.md#reports) | `.510/reports/report.json` or `.510/reports/runs/<id>.json` | CLI and MCP analysis save findings and coverage gaps, retaining partial results when a run fails or is incomplete. |
| [handoff notes](guides/handoff.md) | a unique `510-handoff-<unique-id>.md` in the OS temporary directory | `handoff` saves the context needed to continue, with links to existing records; use a requested destination when given. |

for multiple domains, an existing `CONTEXT-MAP.md` points to the relevant contexts,
their glossaries, and decision records. `AGENTS.md` links these documents and
describes how to work in its scope. investigation notes and progress logs stay in
workflow storage, outside the instruction hierarchy.

**saved does not mean committed.** project instructions, glossaries, and decision
records normally belong in version control. project-local explorations, specs,
and implementation notes may be committed when repository policy allows it.
setup ignores debug evidence, analysis reports, and generated tooling data;
handoffs stay temporary by default. existing ignore rules remain authoritative.
in **this repository**, the entire root `.510/` directory stays local and untracked,
including explorations, specs, and implementation notes.

the `.510/` paths above are defaults. shared or custom storage keeps each project's
workflow records under its configured project directory; it does not relocate
`AGENTS.md`, domain docs, or decision records. use the
[storage guide](guides/workflow-storage.md) to resolve the saved locations.
records stay outside the installed skill, and a handoff to another machine needs
the referenced local files as well as the handoff document.

## more details

510 also includes local code search and a set of JavaScript and TypeScript checks
called **Blindfolded**. these help surface possible bugs, unused code, dependency
problems, duplicate code through Fallow, and code that needs a closer look.

510 uses [STE-inspired writing guidance](guides/output.md) for replies and documents.
it keeps sentences clear and terms consistent while preserving technical meaning,
uncertainty, code, and evidence. the guidance applies to returned output.

Two internal guides support these workflows: [writing for agents](guides/writing-for-agents.md)
helps structure instructions and continuation documents, while
[architecture improvement](guides/improve-codebase-architecture.md) helps `explore`,
`review`, and `refactor` compare structural changes. They are loaded when relevant
within 510 and need no separate invocation.

- [automated checks and their limits](guides/analysis.md)
- [where explorations, specs, and debug notes are saved](guides/workflow-storage.md)
- [tooling and development](docs/development.md)

## credits

the shared output guidance adapts
[danyuchn/asd-ste100-skill](https://github.com/danyuchn/asd-ste100-skill).
see [what changed](guides/upstream/asd-ste100-skill/UPSTREAM.md) and the
preserved [MIT license](guides/upstream/asd-ste100-skill/LICENSE).

the project instruction hierarchy and its maintenance adapt
[Agent Zero's DOX](https://github.com/agent0ai/dox), built into `510 init` and
ongoing editing workflows. see [what changed](guides/upstream/agent0ai-dox/UPSTREAM.md)
and the preserved [MIT license](guides/upstream/agent0ai-dox/LICENSE).

the planning, implementation, debugging, conflict resolution, and handoff workflows,
plus internal design and writing guidance, build on
[Matt Pocock's skills](https://github.com/mattpocock/skills).
see [what changed](guides/upstream/mattpocock-skills/UPSTREAM.md) and the
preserved [MIT license](guides/upstream/mattpocock-skills/LICENSE).

the code checks build on [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop).
see [source and changes](src/blindfolded/oxlint/UPSTREAM.md),
[license](LICENSE), and [full credits](docs/development.md#attribution).
