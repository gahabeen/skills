# Project setup and read-only skill installations

510 retains one explicitly invoked skill. A request for **510 init** uses its
bundled CLI to prepare project storage, install the complete toolchain, produce
an MCP connection file, and check readiness. It works before MCP is connected.

The installed skill is immutable during setup and normal use. Its source,
instructions, manifest, and lockfile form a replaceable distribution. This
supersedes ADR 0003's storage inside the installed toolchain; ADR 0004's Bun
runtime and Node-only RuleTester development dependency remain unchanged.

Project configuration lives at `.510/config.json`. A new project defaults to
`.510/` storage. Shared `~/.510/` and custom directory choices are explicit setup
options; repeated setup preserves the existing choice. Relative custom paths
resolve from the canonical project root. CLI discovery prefers an existing 510
configuration or Git root, then the nearest package directory; `--root` overrides
discovery. The MCP server always receives an explicit root.

Toolchains are keyed by the manifest, lockfile, Bun version, OS, and architecture.
Setup installs into staging with the frozen lockfile and disabled lifecycle
scripts. It reuses a matching healthy installation, guards concurrent setup with
an exclusive lock, and preserves earlier versions. Configuration is persisted
only after installation succeeds. Updating the skill does not erase project data.

Local storage contains `toolchains/`, `cache/`, `reports/`, and `tmp/`. Shared or
custom storage places cache, reports, and temporary files in
`projects/<canonical-root-hash>/`, allowing shared dependencies without sharing
project search history. Setup preserves existing ignore entries and ignores its
generated directories. `.510/mcp.json` contains local absolute connection paths
and is ignored; agent registration remains separate from preparing that file.

Analysis settings can live in the configuration's `analysis` object. When absent,
the existing `.blindfolded.json` is used. Existing reports and legacy skill caches
are left intact. New CLI reports default to `.510/reports/report.json`; MCP jobs
use its `runs/` subdirectory. Every finding and incomplete required check still
fails, with partial evidence retained.

Generated storage is excluded from source and compiler-project discovery,
including custom directories inside the repository. Temporary rule copies have
writable permissions even when copied from a read-only installation. Normal
completion and cancellation clean temporary files; abrupt termination can leave
temporary files or a setup lock. Reports persist until explicitly removed.

Validation covers read-only installed bundles, Node-free execution, all analyzers,
default and custom setup, repeated setup, nested working directories, shared
dependencies with separate project data, version changes retaining old state,
generated-source exclusions, and native FFF search over MCP.
