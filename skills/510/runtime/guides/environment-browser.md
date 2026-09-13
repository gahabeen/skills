# Browser application changes

Use for browser APIs, bundling, and browser-visible behavior.

Confirm the bundler, supported browser targets, compiler libraries, and build/test
scripts from the project. Type declarations do not install polyfills. Check actual
runtime support before introducing APIs such as iterator helpers.

Keep credentials and server-only dependencies outside browser bundles. Inspect
the actual loading path when a change affects lazy imports or bundle contents.
Use existing component, integration, or browser tests to verify user behavior,
including relevant error and loading states. A compiler check does not establish
rendering, focus, network behavior, or accessibility.

Run production build or browser verification only as part of authorized runtime
checks, separately from static analysis. Record untested targets.

Reference: [TypeScript lib](https://www.typescriptlang.org/tsconfig/lib.html).
