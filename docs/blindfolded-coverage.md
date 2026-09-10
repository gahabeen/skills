# Blindfolded coverage and decisions

Status: the user confirmed the implementation contract. The default static suite,
combined reporting, Bun module-mocking support, and updated skill workflow are
implemented. Repository adoption findings remain visible in analysis reports.

## Accepted decisions

1. Cover both defects/contracts and structural/testability evidence.
2. Run every supported static analyzer by default, without tool opt-ins.
3. Every finding fails, including Review signals.
4. Incomplete required checks fail, preserving partial results.
5. Use dedicated stricter TypeScript analysis profiles; preserve build settings.
6. Allow tooling configuration evaluation; do not start the application, its
   tests, builds, generation scripts, or runtime profiling.
7. Exclude CodeQL for this version because its separate prerequisites would
   constrain consumers of a public GitHub-installed skill.

These choices are recorded in [scope](adr/0001-default-static-analysis-suite.md),
[success criteria](adr/0002-complete-coverage-and-zero-findings.md), and the
[glossary](../CONTEXT.md). 510 is private and Bun-managed, distributed
from `gahabeen/skills`. The public skill is `510`; Blindfolded remains the internal
analysis capability and Oxlint plugin namespace. See the
[shared-runtime decision](adr/0003-one-skill-shared-runtime.md).

## Implemented coverage

| Area | Implementation | Evidence boundary |
| --- | --- | --- |
| Custom constraints | 18 Oxlint rules, including Bun module-mocking calls | AST and lexical scope; individual limitations are in the rule reference. |
| Async contracts | Native type-aware floating/misused-promise rules | Requires resolvable type information; void expressions do not exempt detached promises. |
| Union cases | Native exhaustive-switch rule | Default branches do not exempt missing union members. |
| Indexed/optional contracts | Dedicated TypeScript no-emit profiles | Original config settings are inherited; strict indexed and optional checks are enabled. |
| Cyclomatic complexity | Oxlint classic, above 20 by default | Review evidence; nested functions are measured separately. |
| Nesting | Oxlint max-depth, above 4 by default | Review evidence, not proof of a defect. |
| Cognitive complexity | SonarJS through ESLint and the TypeScript parser, above 15 | Syntax-based review evidence. |
| Reachability | Knip files/exports/types/dependencies and configuration hints | Entry points, framework discovery, and dynamic loading affect interpretation. |
| Dependency structure | Dependency-cruiser cycles, unresolved imports, project rules | Includes type-only dependencies; no invented application layers. |
| Effects/testability | Required contextual review workflow and reporting template | Source observations and agent judgments are distinguished from automated diagnostics. |
| Result integrity | Combined JSON/text report, per-tool completion and coverage gaps | Findings, warnings, missing tools, and incomplete scans all fail. |

The self-contained 510 skill carries the CLI/MCP runtime, rule assets, and a private
toolchain manifest plus lockfile. Oxlint and its plugin API are pinned together;
tsgolint is compatible with that pair. Compiler checking uses TypeScript 7.0.2,
while parser-based tools use TypeScript 5.9.3 in the isolated toolchain.

## Verification

Integration tests install an isolated copy of the skill and exercise all five
analyzers against real source. They cover accepted/rejected typed contracts,
blocking Review findings, complexity/nesting, cycles, unused files, architecture
boundaries, missing analyzers with retained findings, unchanged build settings,
JavaScript without a tsconfig, configuration evaluation/failure, and unsupported
source/opt-out settings. The analysis command does not run the fixture's
application startup, test, or build scripts.

Existing rule and installation tests continue to validate source behavior,
attribution, overwrite protection, and editable-plugin installation. Asset
synchronization checks compare the distributed rules against canonical source.

## Remaining boundaries

- No runtime analysis, CodeQL integration, whole-program purity proof, or
  composite quality/testability score.
- Vue, Svelte, and Astro embedded scripts currently produce a coverage gap.
- Missing declarations and unresolved imports fail; no build scripts are run
  to recover generated artifacts.
- Oxlint's typed backend may use the nearest application config rather than the
  supplied profile. Actual project assignments are recorded and unmatched files
  or unsupported compiler settings fail coverage. The dedicated TypeScript check
  still applies the stricter flags without changing application settings.
- Source outside configured compiler projects fails coverage. Adjust legitimate
  project boundaries/configuration instead of hiding owned files.
- Monorepo graph alias resolution may require the project's dependency-cruiser
  configuration. Configuration objects must be serializable and executable by
  the supported runtime; unsupported configuration fails explicitly.
- Contextual effects/testability judgments are reported by the reviewing agent.
  They are not misrepresented as automated findings or purity proofs.
- Existing policy findings remain blocking when analyzing this repository.
  Development implementation checks and a clean policy assessment answer
  different questions.

## Primary references

- [Oxlint type-aware analysis](https://oxc.rs/docs/guide/usage/linter/type-aware.html)
  and [complexity](https://oxc.rs/docs/guide/usage/linter/rules/eslint/complexity).
- [TypeScript indexed access](https://www.typescriptlang.org/tsconfig/noUncheckedIndexedAccess.html)
  and [optional properties](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html).
- [Knip configuration evaluation](https://knip.dev/explanations/plugins).
- [Dependency-cruiser configuration](https://github.com/sverweij/dependency-cruiser/blob/main/doc/options-reference.md).
- [SonarJS](https://github.com/SonarSource/SonarJS/blob/master/packages/analysis/src/jsts/rules/README.md).
- [Bun module mocks](https://bun.sh/docs/test/mocks#module-mocks-with-mock-module).
- [CodeQL CLI availability](https://docs.github.com/en/code-security/concepts/code-scanning/codeql/codeql-cli)
  and [terms](https://github.com/github/codeql-cli-binaries/blob/main/LICENSE.md).
