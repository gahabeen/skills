# Progressive guidance and TypeScript boundaries

510 keeps one explicitly invoked skill. Shared instructions cover only common
constraints; workflow phases and environment/rule references load on demand.
The CLI and MCP share phase/rule retrieval and a read-only package profile.
No additional installed skills, dependencies, or automatic workflow execution
are introduced. Behavioral evaluation fixtures live outside the installed bundle.

Untrusted inputs may use unknown in implemented functions with explicit concrete
results. Type predicates and error causes retain their exceptions. This is a
boundary contract, not an AST proof of validation. Runtime tests and contextual
review remain required. The typeof rule now checks redundant local primitive
contracts, allowing union, unknown, and unresolved representations to be narrowed.

Reports add identities, grouping, and baseline correspondence. Comparisons never
suppress findings or make an incomplete run pass. All six analyzers, every finding,
and required coverage retain the contract in [ADR 0002](0002-complete-coverage-and-zero-findings.md).
Matched diagnostics are existing; unmatched diagnostics under incomplete or changed
scope/policy remain uncompared. IDs are stable under line shifts and checkout moves,
not semantic rename tracking. Policy revisions require a new report policy version.

Maintain behavior and context evaluations alongside runtime tests. Compare repeated
cases under the same model and constraints; retain missing telemetry as unknown.
A shorter guide or one successful agent run does not establish improved correctness.
