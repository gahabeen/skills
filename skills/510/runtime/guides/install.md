# Install an editable Blindfolded Oxlint plugin

First prepare and run the [complete static suite](analysis.md). This procedure
adds editable rules to the repository's own Oxlint integration; it does not
replace or reduce the default suite. The skill's isolated analyzer dependencies
live in the configured project or shared storage outside the installed skill.

The tested bundle runs Oxlint and its TypeScript plugins with Bun 1.4.2.
Use `bun --bun oxlint` to run a consuming repository's installed Oxlint with Bun.
Node 24 is needed only for the upstream `RuleTester` when developing custom rules.

1. Copy the bundled plugin from this skill. Run from the target repository:

   ```bash
   bun <skill-directory>/scripts/510.mjs install-rules
   ```

   This creates `tools/oxlint/blindfolded/`. Pass another relative destination as the first argument when the repository has an established tooling layout. The script refuses to replace an existing destination. Route existing copies through [the update procedure](update.md). Run this installer with Bun.

   Preserve the root `LICENSE` and `UPSTREAM.md`, and the nested `vendor/eslint-stylistic/LICENSE` and `UPSTREAM.md`; they travel with the copied rule. Readability enforcement is self-contained and requires no Stylistic plugin dependency.

   Complete when the files, including vendored license and provenance, exist at the agreed destination without replacing an existing copy.

2. Install compatible dependencies. This bundle was tested with `oxlint` and `@oxlint/plugins` at **1.78.0**:
   - If the repository already depends on `oxlint`, read its installed version from the package manager or lockfile and install `@oxlint/plugins` at exactly that version. Pin it exactly rather than by range so future upgrades move both packages together.
   - When neither dependency exists, install the tested pair exactly (`bun add -d -E oxlint@1.78.0 @oxlint/plugins@1.78.0` in a Bun repository). If an existing pair is older, verify compatibility with representative plugin cases; upgrade both together only if required. For a requested newer version, verify the released pair and test it rather than assuming matching version numbers guarantee compatibility.
   - `oxlint` is a development dependency. The copied source imports `@oxlint/plugins`, so install it as a development dependency for a local-only plugin.
   - Do not replace the package manager or rewrite unrelated dependency ranges.

   Complete when matching compatible versions are installed and unrelated dependency ranges are preserved.

3. Register the generic plugin, configure ignores, and enable all generic rules. For `oxlint.config.ts` or `.oxlintrc.json`, merge these fields with the existing configuration:

   ```ts
   ignorePatterns: [
     ".agent/**",
     ".agents/**",
     ".claude/**",
     ".codex/**",
     ".continue/**",
     ".cursor/**",
     ".gemini/**",
     ".opencode/**",
     ".pi/**",
     ".roo/**",
     ".windsurf/**",
     "tools/oxlint/blindfolded/**",
   ],
   jsPlugins: [
     { name: "blindfolded", specifier: "./tools/oxlint/blindfolded/index.ts" },
   ],
   ```

   Keep every existing ignore. Adjust the final pattern when the plugin was copied elsewhere. Inspect the repository for other project-local agent tooling directories and add them rather than linting installed skills, hooks, or generated agent configuration as application source. Do not broadly ignore all dot-directories, because some repositories keep owned source or checks in them.

   For Vite+, add these fields to `lint.ignorePatterns` and `lint.jsPlugins`. Also merge the same patterns into `fmt.ignorePatterns` so `vp check` does not reformat installed agent assets or the vendored plugin. Merge existing entries instead of replacing them.

   Enable these rules at `"error"`, including the native Oxlint companion rule:

   ```json
   {
     "oxc/no-accumulating-spread": "error",
     "blindfolded/no-array-filter-map": "error",
     "blindfolded/no-reduce-accumulator-copy": "error",
     "blindfolded/no-chained-type-assertions": "error",
     "blindfolded/no-conditional-empty-object-spread": "error",
     "blindfolded/no-known-value-widening": "error",
     "blindfolded/no-module-mocking": "error",
     "blindfolded/no-object-parameters": "error",
     "blindfolded/no-reflect-apply": "error",
     "blindfolded/no-reflect-get": "error",
     "blindfolded/no-runtime-typeof": "error",
     "blindfolded/no-shape-in-symbol-names": "error",
     "blindfolded/no-unknown-parameters": "error",
     "blindfolded/no-unknown-returns": "error",
     "blindfolded/no-unknown-type-aliases": "error",
     "blindfolded/no-unsafe-dictionary-type": "error",
     "blindfolded/no-widen-then-assert": "error",
     "blindfolded/require-readable-spacing": "error",
     "blindfolded/require-safety-comment-for-type-assertion": "error"
   }
   ```

   For `no-array-filter-map`, prefer lazy `.values().filter(...).map(...).toArray()` pipelines only when the target runtime supports iterator helpers; otherwise use an appropriate single `flatMap` or locally mutating reducer. Review callback order, indexes, sparse arrays, `thisArg`, and filtering semantics rather than mechanically rewriting chains. Unknown receiver types are deliberately not inferred by this AST/scope rule.

   Pair `no-reduce-accumulator-copy` with native `oxc/no-accumulating-spread`: the custom rule catches supported non-spread copies such as `Object.assign({}, acc, item)`, `Array.from(acc)`, and array accumulator `concat`/`slice` calls. Mutating a fresh local accumulator is allowed; copying individual input items is also allowed. Named callbacks, indirect helpers, and nested accumulator properties are not fully analyzed, so do not claim all quadratic reducers are ruled out.

   Also enable cyclomatic-complexity reporting from the copied `review.config.json`.
   In `.oxlintrc.json`, append its path to the existing `extends` array:

   ```json
   { "extends": ["./tools/oxlint/blindfolded/review.config.json"] }
   ```

   For a TypeScript or Vite+ configuration, merge the equivalent rule into `rules`
   or `lint.rules`:

   ```json
   { "eslint/complexity": ["warn", { "max": 20, "variant": "classic" }] }
   ```

   Preserve an existing project's complexity threshold, variant, severity, and
   existing local overrides, including an unprefixed `complexity` configuration. Avoid
   registering both rule names. For a new installation, 20 is the tool-default
   reporting threshold, not a research-backed quality limit. Classify findings
   as **Review**. The full Blindfolded analysis always fails on these findings.
   Warnings alone do not fail a standalone Oxlint run, but existing
   `--deny-warnings` or warning budgets can make them fail; report that interaction
   rather than changing the project's CI policy. See
   [measurement and interpretation](static-analysis.md#cyclomatic-complexity).

   Complete when the generic rules and complexity reporting are configured and
   existing configuration is preserved.

4. Run the complete static suite and the repository's static lint/type checks. Inspect custom commands before invoking them; do not start the application, its tests, or builds as part of analysis. If findings appear in owned project source, report them and fix them only when the user asked for migration/cleanup. Do not suppress rules, weaken rule severity, add unsafe casts, or mechanically launder types to make lint pass.

   When cleanup is authorized, apply `require-readable-spacing` with lint autofix, then run the repository's formatter and lint again. Confirm a second fix/format pass leaves files unchanged. Keep whitespace fixes separate from semantic edits, preserve documentation attachment and overload groups, and do not enable an entire competing formatting preset.

   Complete when checks have run, fix/format stability has been verified for authorized cleanup, and every failure is resolved or reported with its diagnostics.

5. Retain and extend the bundled `UPSTREAM.md` beside the vendored entry point: source repository, exact source commit or recoverable pristine snapshot when available, installed plugin paths, and intentional deviations. Verify that the revision identifies the actual copied assets; a package version or the current upstream HEAD alone is insufficient. If provenance cannot be established, record it as unknown rather than guessing.

   Review the final diff and report the installed path, source identity, dependency/configuration changes, and check results. Complete when the record and report describe the files actually installed and any remaining findings.
