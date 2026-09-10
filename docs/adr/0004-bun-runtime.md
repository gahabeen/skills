# Bun runtime, Node only for rule-development tests

510 runs its installed CLI, local MCP server, native FFF integration, and all
five static analyzers with Bun 1.4.2. This supersedes the dual-runtime installation
requirement in [ADR 0003](0003-one-skill-shared-runtime.md).

Setup uses the running Bun executable and the frozen toolchain lockfile. Doctor
checks that executable's version, locked packages, and native FFF loading.
MCP connection generation records absolute Bun and server paths so a connected
agent does not need Bun or Node on its own PATH. Analyzer workers and JavaScript
tool entrypoints inherit Bun through `process.execPath`.
Package loading verifies the installed pinned dependency before resolution.
Server and analyzer subprocesses disable Bun's automatic package installation,
so a missing tool cannot be silently supplied from a global cache or download.

The pinned Oxlint 1.78.0 CLI loads our custom rules under Bun. Its development
`RuleTester` explicitly rejects Bun because its parser requires unsupported
runtime features. Keep Node 24 for `test:rules` and the development CI job;
do not re-execute the installed CLI or MCP server under Node. Node-compatible
imports and the FFF SDK's `fff-node` package name do not require a Node process.

Installed-skill tests run with Bun and an empty executable search directory,
checking that Node cannot be launched from PATH. They cover repeated setup,
doctor, absolute connection configuration, rule installation, all analyzers,
native search, MCP pagination, and shutdown with partial results. Rule behavior
tests continue to use the upstream Node test harness.

The runtime change preserves the complete default suite: every finding fails,
and missing required coverage fails while retaining other results. Tooling
configuration may execute under Bun; application startup, tests, and builds
remain outside analysis. Revalidate this runtime boundary when updating tools.
