# Write documents an agent can use

Use this internal guide when writing or changing agent instructions, skills,
or documents another agent will use to continue work. Apply [output guidance](output.md)
for sentence clarity. This guide concerns document structure and retrieval.
Keep the user's scope, authority, uncertainty, and format requirements intact.

## Make references actionable

A reference should name its target and say when to read it. Put the task or
decision that triggers it near the start. Give each distinct case one useful
pointer. Prefer a precise condition over a long list of synonyms. Check that
the target exists, is accessible in the installed environment, and contains the
promised guidance. Strengthen a weak pointer before duplicating its target.

Keep shared requirements where every reader needs them. Put conditional detail
in a linked reference and state the condition beside the link. Use one owner for
each rule or contract. Keep a concept's definition, exceptions, and examples
together so an agent can apply it without reconstructing scattered fragments.

## Define useful completion conditions

Separate ordered actions from supporting reference. State the evidence that makes
an action complete, such as accounting for each selected interface or verifying
the saved artifact. Match the required coverage to the actual task. Distinguish
an attempted check, a completed check, and a successful result.

When a step invites premature completion, first make its completion condition
observable. Split a sequence only when the separation helps the reader focus or
keeps conditional material out of the active task. A link alone does not erase
instructions already loaded. Avoid adding mandatory interviews, agents, or
approval gates merely to enforce document structure.

## Keep instructions economical

Use familiar terms consistently and define specialized terms once. State the
desired behavior directly. Keep explicit prohibitions for real boundaries and
pair them with the action to take instead. Preserve meaningful caveats and
evidence limits rather than replacing them with confident wording.

Remove duplicate meanings, stale guidance, and instructions that do not change
the agent's decisions. Prefer links to authoritative configuration over copied
inventories that are cheap to inspect. Retain unwritten conventions, reasons for
decisions, and non-obvious constraints that source alone cannot explain.

Balance the cost of loaded instructions with the user's need to remember entrypoints.
Create a separate workflow only when it has a distinct user purpose. Shared detail
usually belongs behind a conditional link, where callers can reuse it.

## Apply this to 510

510 remains one explicitly invoked skill. Preserve `disable-model-invocation: true`
and `policy.allow_implicit_invocation: false`. Keep public routing in `SKILL.md`
and detailed workflows in bundled guides. Internal references are plain resources
loaded during an authorized 510 workflow. They need no sibling skill installation
or additional top-level command. Invocation behavior depends on the host, so avoid
copying another harness's discovery assumptions into 510 instructions.

Before handing back a document, verify its links, scope, completion conditions,
and agreement with the user's decisions. Validate packaged skill changes through
the repository's checks and regenerate the bundle from canonical sources.

Adapted from Matt Pocock's `writing-for-agents` and `SKILL-MECHANICS.md`;
see [source and license](upstream/mattpocock-skills/UPSTREAM.md).
