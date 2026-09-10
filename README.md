# skills

personal skills for real prod projects, by [@gahabeen](https://github.com/gahabeen).

i'm a software engineer. these are the skills i use day to day with coding agents
to think through ideas, build features, debug problems, and review production code.
they reflect how i work; take what helps and adapt it to your own projects.

## what's here

the workflows currently come together in one skill: **[510](skills/510/SKILL.md)**.

| when i want to… | i use… |
| --- | --- |
| think through a plan and challenge the assumptions | [`510 grill`](guides/grill.md) |
| turn a conversation into a clear spec | [`510 spec`](guides/spec.md) |
| build from a spec, test the changes, and commit the work | [`510 implement`](guides/implement.md) |
| reproduce a bug, find the cause, and check the fix | [`510 debug`](guides/debug.md) |
| review code and understand the findings | [`510 review`](guides/review.md) |
| simplify code without changing what it does | [`510 refactor`](guides/refactor.md) |
| commit the changes from the current conversation | [`510 commit`](guides/commit.md) |
| leave useful notes for the next session | [`510 handoff`](guides/handoff.md) |

## get started

install with Bun **1.4.2**:

```sh
bunx --bun skills add https://github.com/gahabeen/skills --skill 510
```

invoke `$510` explicitly in your coding agent, then ask for the workflow you need.
it only runs when you ask for it. for example:

```text
$510 grill this plan for order cancellation
$510 spec order cancellation
$510 implement .510/specs/order-cancellation.md
```

for code search and automated checks, ask for **510 init** in your project first.
`init` keeps its files in the project's `.510/` directory by default and reuses
any storage location you've already chosen. planning and handoff don't need initialization.

see [initialization and storage](guides/toolchain.md) for manual commands, other storage
locations, and connecting the local tools to your agent.

## more details

510 also includes local code search and a set of JavaScript and TypeScript checks
called **Blindfolded**. these help surface possible bugs, unused code, dependency
problems, and code that needs a closer look.

- [automated checks and their limits](guides/analysis.md)
- [where specs, debug notes, and reports are saved](guides/workflow-storage.md)
- [tooling and development](docs/development.md)

## credits

the planning, implementation, debugging, and handoff workflows build on
[Matt Pocock's skills](https://github.com/mattpocock/skills).
see [what changed](guides/upstream/mattpocock-skills/UPSTREAM.md) and the
preserved [MIT license](guides/upstream/mattpocock-skills/LICENSE).

the code checks build on [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop).
see [source and changes](src/blindfolded/oxlint/UPSTREAM.md),
[license](LICENSE), and [full credits](docs/development.md#attribution).
