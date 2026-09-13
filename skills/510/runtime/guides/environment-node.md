# Node library changes

Use for Node packages and public distribution changes.

Read the owning package's `type`, `exports`, `main`, `types`, engines, scripts,
and compiler module settings. Confirm whether consumers load source or built
artifacts. Do not infer CommonJS/ESM behavior from the file extension alone.

Verify changed exports through the supported package entrypoint in each declared
consumption form. Check emitted declarations with a TypeScript consumer when
types are published. Include supported Node versions and conditional exports
that the change affects. Avoid source-only imports that bypass the distribution.

Use the existing build process separately from static analysis. Missing emitted
files or unavailable runtimes are verification gaps. Keep browser-specific APIs
outside Node paths unless the package intentionally supplies an adapter.

References: [Node packages](https://nodejs.org/api/packages.html),
[TypeScript modules](https://www.typescriptlang.org/docs/handbook/modules/reference.html).
