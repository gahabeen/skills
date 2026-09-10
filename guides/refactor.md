# 510 refactor

Use the scope or intended improvement after `510 refactor`, or the refactoring
request already established in the conversation.

Prefer the harness's native editing tools for authored changes, and review the
resulting diff before continuing.

Follow [DOX documentation maintenance](dox.md): read the applicable `AGENTS.md`
chain before editing and check affected contracts and indexes before final
verification. Leave docs unchanged when their contracts still describe the result.

Establish the intended improvement and observable behavior to preserve. Read the
[510 review workflow](review.md), run the complete static suite, and inspect the
relevant findings in source. Label pre-existing findings without treating them as
passing. Read [effects and testability](effects-and-testability.md) when ownership,
external operations, or hidden dependencies matter.

When the change affects module responsibilities, interfaces, or test seams, read
[codebase design](codebase-design.md). Inspect real caller contracts and compare
how much knowledge each proposed interface requires. Prefer a cohesive module
that owns the complexity; do not add indirection or expose internals merely to
make mocking easier. Preserve distinct regression coverage when consolidating tests.

Choose a change that addresses a concrete problem: a broken contract, repeated
knowledge, excessive branching, an unclear responsibility, or a dependency that
makes the module hard to understand or verify. A higher complexity score is a
reason to inspect the function; extracting arbitrary helpers to lower a number
does not establish an improvement.

Preserve callback order, sparse-array behavior, omitted properties, error behavior,
type information, and mutation ownership. Prefer a cohesive change over a series
of wrappers that merely move complexity. Match the repository's established
interfaces and naming where they remain appropriate.

Rerun the full suite after the change and compare findings. Do not weaken policy
or broaden exclusions to get a pass. For behavioral changes or meaningful
regression risks, run the repository's relevant tests separately from the static
analysis command. Pure formatting or moves usually need existing checks rather
than tests that assert their implementation shape.

Explain what became simpler, what behavior was preserved or intentionally
changed, and how verification supports that conclusion. Keep unresolved findings
and coverage gaps visible. Review-only and brainstorming requests do not
authorize implementation changes.

The CLI `refactor` command prints this guide; the agent performs the refactoring.
