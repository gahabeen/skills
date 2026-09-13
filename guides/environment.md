# Select environment guidance

Use this reference when implementation or verification depends on a TypeScript
project's runtime, framework, module system, or workspace structure.

MCP `profile` and CLI `profile --root PATH [--path PATH]` inspect package metadata,
lockfiles, compiler configuration references, and scripts without setup or execution.
They return evidence, unresolved facts, and candidate guide topics. A declared
dependency is a clue, not proof that the current task uses its framework.

Confirm the target package and relevant callers. Read its actual compiler config
and referenced configs before making module decisions. Use the project's existing
package manager, supported runtimes, and commands. 510's Bun runtime does not
change the application's runtime. Refresh the profile when these files change.

Load only applicable references:

- [Node libraries](environment-node.md): changing exports, distribution, or Node-specific behavior.
- [Browser applications](environment-browser.md): browser APIs, bundling, or browser verification.
- [React and Next.js](environment-react.md): components, rendering, or framework data flow.
- [Monorepos](environment-monorepo.md): cross-package contracts, project references, or workspace verification.

Do not infer support from TypeScript declarations alone. Confirm library and
framework versions from the project and consult matching first-party documentation
when a version-specific behavior matters. Keep missing build prerequisites explicit.
Static analysis never runs builds, tests, or applications; execute authorized
verification separately through the project's established workflow.
