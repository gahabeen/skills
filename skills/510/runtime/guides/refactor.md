# 510 refactor

Apply the shared [output guidance](output.md) to user-facing replies and authored prose.

Use the scope or intended improvement after `510 refactor`, or the refactoring
request already established in the conversation.

When following a review, use the selected findings and their affected paths.
Reuse current evidence and preserve the recorded baseline. A previous review
does not authorize fixing every finding. If the user requests a general refactor
without selecting findings, identify a coherent first improvement from the review.

When the structural direction is still open, use
[architecture improvement](improve-codebase-architecture.md) to compare candidates.
Reuse an already-selected direction and preserve this refactor's scope and checks.

Prefer the harness's native editing tools for authored changes, and review the
resulting diff before continuing.

Follow [DOX documentation maintenance](dox.md): read the applicable `AGENTS.md`
chain before editing and check affected contracts and indexes before final
verification. Leave docs unchanged when their contracts still describe the result.

Apply the [coding rules](codebase-design.md#coding-rules) to changed code, including
verification through public package entrypoints when exports or build output change.

Establish the intended improvement and observable behavior to preserve. Read the
[510 review workflow](review.md), run the complete static suite, and inspect the
relevant findings in source. Label pre-existing findings without treating them as
passing. Read [effects and testability](effects-and-testability.md) when ownership,
external operations, or hidden dependencies matter.

Use this refactor's declared scope when applying review. Check architecture,
tests, and documentation affected by the proposed change. Broader review results
remain useful context; do not reset the change scope to the repository by default.

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
or broaden exclusions to get a pass. Repeat contextual review of the affected
contracts, tests, and docs, and retain unresolved baseline findings.
For behavioral changes or meaningful regression risks, run the repository's
relevant tests separately from the static
analysis command. Pure formatting or moves usually need existing checks rather
than tests that assert their implementation shape.

Explain what became simpler, what behavior was preserved or intentionally
changed, and how verification supports that conclusion. Keep unresolved findings
and coverage gaps visible. Review-only and brainstorming requests do not
authorize implementation changes.

The CLI `refactor` command prints this guide; the agent performs the refactoring.
