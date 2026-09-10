# Domain modeling during a grill

Sharpen the project's language and record decisions while applying
[grilling](grilling.md). Read the repository's instructions and existing domain
docs first. Reuse its document locations and conventions.

If `CONTEXT-MAP.md` exists, follow it to the relevant context and its decision
records. Otherwise use a root `CONTEXT.md` and `docs/adr/` when no established
locations exist. Create a file or directory only when there is resolved content
to put in it. If the applicable context is ambiguous and matters, ask.

## Resolve the model

- Compare the user's terms with the glossary. Surface conflicting definitions
  and overloaded words; propose a precise canonical term.
- Test relationships with concrete examples and edge cases. Check boundaries,
  ownership, and what happens when an entity changes state.
- Compare claims about current behavior with the code. Distinguish current
  behavior from desired behavior; surface contradictions for resolution.
- Record agreed terminology as soon as it is resolved. Keep open questions and
  proposed definitions out of the accepted glossary.

## Keep a concise glossary

Use the repository's existing format. With no established format, start with a
context title, a short description, and a language section:

```markdown
# Ordering

The concepts used to place and track customer orders.

## Language

**Order**:
A customer's confirmed request for a set of products.
_Avoid_: Purchase, transaction
```

Include project-specific concepts, each defined in one or two sentences. Choose
one canonical term and record confusing alternatives under `_Avoid_`. Group terms
only when natural clusters emerge. Keep new glossary entries about domain meaning;
put implementation plans and decisions in their appropriate documents. Preserve
unrelated existing content rather than reorganizing it as part of the interview.

## Record consequential decisions sparingly

Create an architecture decision record (ADR) when a resolved decision meets all
three criteria: it is costly to reverse, would surprise a future reader without
context, and reflects a real choice between alternatives. Routine, obvious, or
easily reversible choices usually need no ADR.

Reuse the existing numbering and template. Otherwise choose the next unused
number in `docs/adr/` and a descriptive filename such as `0001-order-ownership.md`.
A title and a short paragraph covering the context, chosen option, and reason
are sufficient. Include alternatives or consequences only when they help explain
the tradeoff. When revisiting a recorded decision, preserve its rationale and
make the new status or superseding record clear.

Write settled decisions during the session. Mark proposals as proposed instead
of implying acceptance; do not manufacture agreement from an unanswered question.
Finish by pointing to the files changed and the questions that remain open.

Adapted from Matt Pocock's `domain-modeling` and its format references; see
[source and license](upstream/mattpocock-skills/UPSTREAM.md).
