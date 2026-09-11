# 510 grill

Apply the shared [output guidance](output.md) to user-facing replies and authored prose.

Stress-test the user's plan or decision and record the shared understanding as
it develops. Treat text after `510 grill` as the subject; otherwise use the
current conversation. If no subject is identifiable, ask for it.

Read and apply both bundled guides:

- [Grilling](grilling.md): ask decision questions in rounds, resolving their
  prerequisites before asking dependent questions.
- [Domain modeling](domain-modeling.md): challenge terminology, test concrete
  scenarios against code, and capture agreed terms and significant decisions.

Through MCP, load `guide` with topics `grilling` and `domain-modeling`. Without
MCP, read the linked files or use `510 guide TOPIC`. These resources are included
in the 510 bundle; no separate skill installation, setup, or static analysis is
needed for this workflow.

Use the user's existing answers and the repository's docs before opening a round.
When continuing an [exploration](explore.md), read and reference its document;
reuse its findings and open questions without treating tentative options as
accepted decisions. If it has no proposed direction yet, continue exploration
when that fits the user's request instead of inventing a plan to challenge.
Write resolved terms and decisions as they emerge, keeping unresolved proposals
clearly separate. Documentation is part of `510 grill`; if the user requests
discussion only, keep the notes in the conversation.

Finish with the agreed outcome, document paths, and any unresolved decisions.
Grilling alone authorizes the interview and its documents. Continue implementation
when it was also requested and its necessary decisions are settled; preserve
authorization already given without asking for it again.

Adapted from Matt Pocock's `grill-with-docs`; see [source and license](upstream/mattpocock-skills/UPSTREAM.md).
