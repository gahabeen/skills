# 510 implement

Build selected requirements in tested slices, verify standards and spec coverage,
then commit locally unless the user requests otherwise. Preserve unrelated work
and existing staging. No push, deployment, or external ticket update is implied.

Load only the current phase. Later phases remain required; defer their detailed
instructions until the work reaches them. Reuse an already-read, unchanged guide.

| Phase | When to load | Guide |
| --- | --- | --- |
| select | Start or resume; resolve scope and record the starting state | [Select work](implement-select.md) |
| build | Requirements and authorized scope are established | [Build behavior](implement-build.md) |
| verify | Selected behavior is implemented | [Verify code and requirements](implement-verify.md) |
| finish | All required verification and review pass | [Commit and return results](implement-finish.md) |

Use MCP `guide {topic: "implement", phase: "select"}` or CLI
`guide implement --phase select`; substitute the current phase.
Without a phase, retrieval returns this routing guide.

Do not invent a spec or resolve unanswered product decisions by assumption.
When a decision is missing, continue independent authorized work and keep that
decision pending. Honor a single-slice or leave-uncommitted request.

Use [output guidance](output.md) for replies. Coding, documentation maintenance,
storage, environment, and testing details are referenced by the phase that needs
them. The agent performs this workflow; the CLI prints instructions.

Adapted from Matt Pocock's implementation and review workflows;
see [source and license](upstream/mattpocock-skills/UPSTREAM.md).
