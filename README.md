# skills

personal skills for real prod projects, by [@gahabeen](https://github.com/gahabeen).

i'm a software engineer. these are the skills i use day to day with coding agents
to think through ideas, build features, debug problems, and review production code.
they reflect how i work; take what helps and adapt it to your own projects.

## what's here

the workflows currently come together in one skill: **[510](skills/510/SKILL.md)**.

| when i want to… | i use… |
| --- | --- |
| understand an area of code and how it fits together | [`510 explain`](guides/explain.md) |
| think through a plan and challenge the assumptions | [`510 grill`](guides/grill.md) |
| turn a conversation into a clear spec | [`510 spec`](guides/spec.md) |
| build from a spec, test the changes, and commit the work | [`510 implement`](guides/implement.md) |
| reproduce a bug, find the cause, and check the fix | [`510 debug`](guides/debug.md) |
| assess the repository and prioritize improvements | [`510 review`](guides/review.md) |
| simplify code without changing what it does | [`510 refactor`](guides/refactor.md) |
| commit the changes from the current conversation | [`510 commit`](guides/commit.md) |
| package the conversation's work into a draft pull request | [`510 pr`](guides/pr.md) |
| leave useful notes for the next session | [`510 handoff`](guides/handoff.md) |

## get started

install with Bun **1.4.2**:

```sh
bunx --bun skills add https://github.com/gahabeen/skills --skill 510
```

invoke `$510` explicitly in your coding agent, then ask for the workflow you need.
it only runs when you ask for it. for example:

```text
$510 explain how checkout works
$510 grill this plan for order cancellation
$510 spec order cancellation
$510 implement .510/specs/order-cancellation.md
$510 review
$510 review packages/billing
$510 pr --base main
```

`510 review` assesses the whole repository. add a path to focus on one area.
it combines automated checks with source review of architecture, behavior coverage
in tests, and documentation. it reports exclusions, gaps, and priorities without
editing source. tests and builds are not run by default.

the usual sequence is **review → select priorities → refactor → review again**.
`510 doctor` checks the 510 installation and search readiness.

`510 pr` can infer the base from an existing PR, repository configuration, or the
destination's default branch. use `--base` for an explicit target, including a
feature branch for a stacked PR. it checks the full comparison, commits remaining
work, pushes, and opens a draft PR or updates the matching one.

ask for **510 init** in your project first. it prepares code search and automated
checks, and the agent creates or refreshes a hierarchy of `AGENTS.md` files with
project-wide rules at the root and local contracts where they belong. later 510
edits keep the affected instructions and indexes current.

tooling files go in the project's `.510/` directory by default, reusing any storage
location you've already chosen. `AGENTS.md` files live alongside the source they
describe. explanations, planning, and handoff don't need initialization.

see [initialization and storage](guides/toolchain.md) for manual commands, other storage
locations, and connecting the local tools to your agent.

## more details

510 also includes local code search and a set of JavaScript and TypeScript checks
called **Blindfolded**. these help surface possible bugs, unused code, dependency
problems, duplicate code through Fallow, and code that needs a closer look.

510 uses [STE-inspired writing guidance](guides/output.md) for replies and documents.
it keeps sentences clear and terms consistent while preserving technical meaning,
uncertainty, code, and evidence. the guidance applies to returned output.

- [automated checks and their limits](guides/analysis.md)
- [where specs, debug notes, and reports are saved](guides/workflow-storage.md)
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

the planning, implementation, debugging, and handoff workflows build on
[Matt Pocock's skills](https://github.com/mattpocock/skills).
see [what changed](guides/upstream/mattpocock-skills/UPSTREAM.md) and the
preserved [MIT license](guides/upstream/mattpocock-skills/LICENSE).

the code checks build on [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop).
see [source and changes](src/blindfolded/oxlint/UPSTREAM.md),
[license](LICENSE), and [full credits](docs/development.md#attribution).
