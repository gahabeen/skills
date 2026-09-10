# Blindfolded provenance

- Distribution: https://github.com/gahabeen/skills
- Canonical source: `src/blindfolded/oxlint/`
- Skill bundle: `skills/510/runtime/src/blindfolded/oxlint/`
- Derived from: https://github.com/dmmulroy/anti-slop
- Original revision: `c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b`
- Original source path: `src/`
- Imported on: 2026-09-10
- License: MIT; preserve the accompanying `LICENSE` and the nested
  `vendor/eslint-stylistic/LICENSE` and `UPSTREAM.md`.

Local changes: rename the generic plugin namespace to `blindfolded`; relocate
canonical source for a multi-skill repository; use Bun for package management
and commands, and Node for Oxlint rule tests. Omit the Effect-specific plugin,
its five rules, helpers, tests, and configuration guidance. Readability tests
use library-independent generator examples. Extend `no-module-mocking` to
recognize Bun's named `mock` imports (including import aliases), namespace
`mock.module` calls, and named `vi`/`jest` compatibility imports. Other generic
rule behavior and default options are retained from the original revision.

Add `review.config.json` to configure native Oxlint cyclomatic complexity as a
warning above 20 with the classic variant. This is a local review preset; it
does not alter the imported generic rule implementations.

The skill also ships a separately pinned static-analysis toolchain and runner.
Its analysis profile enables typed promise and exhaustiveness checks, strict
indexed/optional-property contracts, nesting, cognitive complexity, dependency
analysis, and unused-code analysis. Every reported finding blocks success,
including warning-level review signals; incomplete analyzers retain partial
results and fail the overall run. These additions do not introduce Effect
library-specific rules or execute the analyzed application's tests or builds.

The original revision identifies the anti-slop base, not a pristine Blindfolded
release. This initial local Blindfolded snapshot has no published commit yet.
When installing or updating, record the actual Blindfolded commit when available
and any local deviations here; never label the current upstream HEAD as the
identity of an older installed bundle.

The 510 reorganization moved this tree under `src/blindfolded/oxlint/` and bundles
it with the shared CLI/MCP runtime. The move preserves the rule implementations
and vendor licenses; analysis, transport, and installation live outside this tree.
