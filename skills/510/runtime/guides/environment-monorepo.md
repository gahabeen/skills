# Monorepo changes

Use when the work crosses packages, exports, workspace tasks, or compiler projects.

Identify the owning package, workspace definition, selected compiler projects,
public dependencies, and affected consumers. Root scripts can differ from package
scripts. A root `package.json` or config is not proof that every package shares
its runtime, module system, or verification command.

Preserve package ownership and supported exports. Verify through consuming
packages when a shared contract changes. Check declared project references and
whether verification requires prebuilt declarations or generated artifacts.

Use relevant package tests during implementation and required workspace checks
before finishing. Broaden scope only for affected callers and contracts. Keep
unrelated packages out of the selected change. The complete static suite still
runs for the declared analysis scope; missing compiler coverage or prerequisite
artifacts remain gaps rather than reasons to weaken settings.

Reference: [TypeScript project references](https://www.typescriptlang.org/docs/handbook/project-references.html).
