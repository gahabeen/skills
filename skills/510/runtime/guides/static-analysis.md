# Static analysis and complexity

The [default suite](analysis.md) combines syntax/scope rules, type-aware checks,
stricter compiler contracts, reachability, dependency graphs, duplication, and complexity.
Keep three questions distinct: whether code violates a contract, whether it
follows an adopted constraint, and whether its structure warrants investigation.

Every finding blocks the analysis command. Classification still describes the
evidence: a failing Review signal does not become a demonstrated defect.

## Cyclomatic complexity

Oxlint's classic metric starts at one per function and increases at decision
points. Nested functions are measured separately. Classic counts individual
non-default switch cases; modified counts a switch once. Default parameters,
short-circuit expressions, and optional chains can also contribute.

The suite reports classic scores above 20 by default. This is a configurable
tool policy, not a research-derived quality boundary. Record score, limit,
variant, and source location. Scores below the threshold are not reported, so
absence of a finding is not an exact score or a proof of simple code.

Cognitive complexity and nesting are separate checks: SonarJS reports difficult
control-flow structure above 15, and Oxlint reports nesting deeper than 4.
Dependency-cycle detection concerns modules, not function branch counts.

A standalone vendored `review.config.json` still marks cyclomatic findings as
warnings for contextual interpretation. The full suite fails on all warnings.
Use `bun run analyze` in this repository for the complete gate. Its
`bun run complexity` development command isolates the native cyclomatic signal.

## Interpretation

Fallow clone groups identify repeated tokens. Compare their responsibilities and
callers before suggesting consolidation. Copies can need independent changes.
The default minimums are 50 tokens and 5 lines in mild mode, excluding module
wiring. Selected tests remain included. See [scope and coverage](analysis.md)
for parser checks and the limits of scoped duplicate detection.

Identify the responsibility or control-flow obstacle before proposing a change.
Do not extract functions merely to move a reported score below a threshold, or
flatten code in ways that obscure state transitions. Preserve callback order,
exceptions, omission versus undefined, sparse-array behavior, and runtime support.

Use [effects and testability](effects-and-testability.md) to inspect controllability,
observability, ownership, and unresolved operations. Local mutation alone does
not establish impurity. No whole-program purity proof or composite quality score
is claimed by the toolchain.

## Primary references

- [Oxlint cyclomatic complexity](https://oxc.rs/docs/guide/usage/linter/rules/eslint/complexity)
  and [ESLint examples](https://eslint.org/docs/latest/rules/complexity).
- [Oxlint type-aware analysis](https://oxc.rs/docs/guide/usage/linter/type-aware.html).
- [TypeScript indexed access](https://www.typescriptlang.org/tsconfig/noUncheckedIndexedAccess.html)
  and [optional properties](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html).
- [Knip analysis](https://knip.dev/explanations/how-knip-works) and
  [configuration evaluation](https://knip.dev/explanations/plugins).
- [Dependency-cruiser options](https://github.com/sverweij/dependency-cruiser/blob/main/doc/options-reference.md).
- [SonarJS](https://github.com/SonarSource/SonarJS/blob/master/packages/analysis/src/jsts/rules/README.md).

The maintainer's shared findings informed this scope. Unverified research claims
and numerical claims from those notes are not represented as established facts.
