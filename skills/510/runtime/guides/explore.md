# 510 explore

Apply the shared [output guidance](output.md) to user-facing replies and authored prose.

Investigate what could change and why, before requiring a plan. Use the idea,
question, problem, or exploration document after `510 explore`; otherwise use the
current conversation. Read an explicitly selected exploration before continuing.
Reuse known constraints and earlier answers. Ask a focused question only when the
subject or a consequential choice remains unclear.

## Explore the possibilities

Ground the discussion in relevant repository instructions, source, domain docs,
and other available evidence. Inspect enough to understand the problem and compare
plausible approaches. Distinguish observed findings from assumptions, tentative
ideas, recommendations, and agreed decisions. Link findings to their evidence and
keep uncertainty visible when evidence is missing or incomplete.

For architectural questions, use [architecture improvement](improve-codebase-architecture.md)
to find and compare structural candidates. Keep this exploration's scope and
document destination, and use [codebase design](codebase-design.md) for interface choices.

Develop promising options with the user, explaining tradeoffs and what would make
one option preferable. Let the discussion change the problem framing or suggest
leaving things as they are. Use questions where answers would change the direction;
do not force an interview, a fixed number of alternatives, or a final choice.
Acceptance criteria and an implementation plan can wait until a direction is agreed.

Exploration needs no toolchain initialization or static analysis run. Use available
read tools for investigation. Invoking it authorizes the discussion, inspection,
and its exploration document; source changes, prototypes, execution, and publication
follow any separate authorization already given.

## Keep a resumable document

Follow [workflow storage](workflow-storage.md). Save in the resolved `explorations`
directory, defaulting to `.510/explorations/<subject>.md`, unless the user selects
another destination or requests discussion only. Saving is part of the workflow;
do not ask for permission again merely to create or update these notes.

Maintain the same document as substantive findings and direction develop. Keep its
structure proportionate to the discussion: useful content includes the context,
findings and references, options and tradeoffs, emerging direction, and open
questions. Clearly mark which decisions the user accepted. Preserve the reasons
for discarded options when they would help a later session avoid repeating work.
Read the saved document back to check that it reflects the conversation.

Finish with the current direction, unresolved questions, and the document's absolute
path when saved. Parking the idea is a valid outcome. If requested, continue with
[grill](grill.md) to challenge a proposed direction or [spec](spec.md) to formalize
agreed requirements, passing the exploration path and keeping tentative ideas
tentative. These are optional transitions; preserve existing authorization without
requiring the user to repeat it.

The CLI accepts `510 explore [subject ...] [--root PATH]` and returns the request
and this guide. The agent investigates and maintains the document. `510 guide explore`
and MCP `guide` with `topic: "explore"` return the same guide.
