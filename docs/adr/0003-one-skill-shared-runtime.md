# One 510 skill over a shared local runtime

The public interface is one `510` skill, backed by a local MCP server and a CLI.
Blindfolded remains an internal capability and Oxlint namespace. Review and
refactoring instructions are guides, not independently installed skills.

## Ownership

- `skills/510/SKILL.md` owns working principles and workflow selection.
- `guides/` owns detailed instructions, loaded only when relevant.
- `src/blindfolded/` owns analysis, findings, job lifecycle, and editable rules.
- `src/search/` adapts the official FFF SDK; it does not reimplement search.
- `src/runtime/` owns dependency loading, setup, health, and guide access.
- `src/cli/` and `src/mcp/` adapt the same capabilities to their interfaces.
- `toolchain/` owns the private manifest and frozen Bun lockfile for all runtime
  dependencies. Root dependencies support development and rule testing.
- `tests/` owns cross-module and isolated-installation tests. Rule behavior tests
  remain beside the rules. `scripts/` owns development utilities.

Generate `skills/510/runtime/` from source, guides, and locked toolchain metadata.
The generated directory mirrors their relative layout and excludes tests and
installed dependencies. Check generation for drift. Installing the skill alone
must work without sibling skills, repository source, or a published npm package.

## Installation and operation

The initial design required Bun 1.4.2 and Node 24.x.
[ADR 0004](0004-bun-runtime.md) replaces the runtime requirement with Bun alone;
Node remains a rule-development dependency. Setup uses a frozen lockfile with
lifecycle scripts disabled. Native FFF binaries are supplied by its locked
platform dependencies. Ordinary setup does not select newer releases.

Doctor reports runtimes, direct dependency versions, and native loading. These
checks do not claim that an agent has connected or that all analyzers cover a
particular project. Connection generation emits absolute executable paths;
registration remains a separate agent integration operation.

The stdio server binds to an explicit repository root. Search initializes FFF on
demand; one active analysis per server avoids overlapping writes. Analysis jobs
return ids, expose findings in pages, save complete reports, and preserve partial
results when the server shuts down. Completed status and successful analysis are
distinct. POSIX shutdown signals terminate analyzer process groups; Windows
process-tree cancellation needs platform-specific validation before claiming parity.

The CLI remains available for terminal and CI use without an MCP connection.
All five analyzers still run, all findings still fail, and incomplete coverage
still fails while retaining partial results. `.blindfolded.json`, report schema,
and installed rule namespaces remain compatible. Search results never substitute
for analysis scope discovery. Runtime execution remains outside static analysis.

The MCP tools are `doctor`, `guide`, `find_files`, `search`, `analyze`, and
`analysis_result`. Guides are also resources. The short skill remains necessary
to express the intended workflow consistently across clients; an MCP connection
alone does not establish that those instructions were loaded.

## Consequences

Users install one bundle and maintain one MCP connection per repository. Internal
modules can evolve without proliferating public skills. We take responsibility
for server lifecycle, input validation, pagination, and integration tests.

Existing development setup/synchronization commands remain aliases. Old installed
Blindfolded skills continue to contain their original runtime; new installations
use `510` and its unified launcher. Migrating an agent's registrations or removing
an old installed skill is separate from reorganizing this source repository.

## References

- [MCP TypeScript SDK server API](https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/docs/server.md)
- [MCP tools](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)
- [MCP prompts and client control](https://modelcontextprotocol.io/specification/2025-11-25/server/prompts)
- [FFF Node and Bun SDK](https://github.com/dmtrKovalenko/fff#node--bun-sdk)
