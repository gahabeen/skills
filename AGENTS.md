# Repository conventions

- Use the fff MCP tools for file and content searches when available.
- Prefer the current harness's native patching and file-editing tools for authored
  changes. Use the tools available in the session to keep edits within the
  harness's change-review feedback loop.
- Use alternative editing methods only when native tools are unavailable or
  unsuitable, and briefly explain why. Established formatters, generators, and
  codemods remain appropriate for their intended tasks. Review the resulting
  changes after each coherent batch, including new files, and preserve unrelated
  work.
- Use Bun for dependencies, runtime execution, and integration tests. Commit both
  `bun.lock` files. Node 24 is only for Oxlint RuleTester development tests.
- 510 is one skill backed by a local MCP server and CLI, distributed directly
  from `gahabeen/skills`. Keep packages private; do not add npm publication tooling.
- Setup, analysis, and search must work with the installed skill read-only.
  Runtime data belongs in configured storage, defaulting to project `.510/`;
  `toolchain/` contains canonical metadata, not the active dependency installation.
- In this repository, keep the entire root `.510/` directory local and untracked,
  including configuration, specifications, and implementation notes.
- 510 requires explicit user invocation. Keep `disable-model-invocation: true`
  and Codex `policy.allow_implicit_invocation: false`.
- `skills/510/SKILL.md`, its agent metadata, and its launcher are authored files.
  `src/`, `guides/`, and `toolchain/` are canonical for runtime code, detailed
  workflows, and pinned dependencies. CLI and MCP entrypoints share capabilities.
- `src/blindfolded/analysis/` owns the complete static suite;
  `src/blindfolded/oxlint/` owns custom rules, tests, and vendored provenance.
- Run `bun run sync:skill` after changing runtime source, guides, or the toolchain.
  Do not edit the generated `skills/510/runtime/` copy. Installing `skills/510`
  alone must produce a self-contained bundle with no sibling-skill dependencies.
- Keep MCP concerns in `src/mcp/` and CLI argument handling in `src/cli/`.
  Preserve analyzer behavior when changing their transport or packaging.
- Preserve upstream licenses and record intentional changes to imported code.
- Run `bun run check` before handing off changes. New rule behavior needs accepted
  and rejected examples; regressions need a focused test. Integration tests live
  in `tests/`; development helpers live in `scripts/`.
- Classify findings as defects, agreed constraints, or review signals. Complexity
  is a signal, and local mutation alone does not establish impurity. Every finding
  and incomplete required check blocks analysis success; retain partial results.
