# 510 explain

Explain the area or question after `510 explain`, or the subject established in
the conversation. A subject can name a path, module, domain concept, or behavior.
Use the requested level of detail. If the subject is unclear, inspect available
context before asking a focused question.

This workflow is read-only. Do not edit files, initialize tooling, run the static
suite, or start the application to explain source. Existing 510 or FFF search
tools can help navigation. Without them, use the harness's available read tools.
No installed analyzer or MCP connection is required.

## Build an explanation from source

Before interpreting source, read the applicable root-to-target `AGENTS.md` chain,
even for a read-only explanation. Use its domain terms and units as evidence;
read relevant architecture decisions when needed.
Find the public entrypoints and actual callers. Follow enough of one representative
path to explain the behavior, including important external dependencies and effects.
Distinguish intended behavior in documentation from behavior observed in source.

Explain the purpose first. Then connect the owning modules, public interfaces,
callers, and data or control flow. Describe where state lives and where ownership
or trust changes when these details help the reader. Use the project's domain
names consistently. A small diagram can help when several relationships matter.

Cite the files that support the explanation. Identify uninspected or dynamic
edges. Do not present a guessed call graph as verified behavior. Suggest a few
useful files to read next when that helps the reader continue.

Keep the response an explanation. A request to understand code does not require
a quality score, a list of speculative defects, or a redesign. If a supported
problem affects the explanation, state its consequence without starting a fix.
Follow the shared [output guidance](output.md).

The CLI accepts `510 explain [subject ...] [--root PATH]`. It returns the request
and this guide. The agent reads the source and writes the explanation.
`510 guide explain` and MCP `guide` with `topic: "explain"` return the same guide.

Inspired by Matt Pocock's `zoom-out` workflow. See the preserved
[source and license](upstream/mattpocock-skills/UPSTREAM.md).
