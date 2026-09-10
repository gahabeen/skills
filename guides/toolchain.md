# Initialize and connect 510

Use this workflow when the user says **510 init**, requests another storage
location, updates the skill, or diagnoses its installation. Keep one installed
510 skill. The bundled CLI works before MCP is connected.

## Initialization

Use Bun **1.4.2**. Locate the intended project and inspect `.510/config.json` if
it exists. Reuse its storage choice unless the user requests a change. For a new
project, default to project-local `.510/`. Available choices are project-local,
shared `~/.510/`, or a custom directory; no separate tool-selection choices exist.

```sh
bun <skill-directory>/scripts/510.mjs init --root /path/to/project
```

To choose a location explicitly:

```sh
bun <skill-directory>/scripts/510.mjs init --root /path/to/project --storage project
bun <skill-directory>/scripts/510.mjs init --root /path/to/project --storage shared
bun <skill-directory>/scripts/510.mjs init --root /path/to/project --storage /path/to/510-data
```

Relative custom paths resolve from the project root. With no `--root`, the CLI
walks upward for an existing 510 configuration or Git root, falling back to the
nearest package directory and then the current directory. In a monorepo, supply
`--root` when a package should have its own initialization.

`init` installs all pinned dependencies using the frozen lockfile with lifecycle
scripts disabled, saves the choice, prepares an MCP connection, and runs doctor.
Its JSON result includes every resolved storage path, whether dependencies were
installed, and the connection file. Repeat runs preserve the configuration and
reuse a healthy matching toolchain. Project dependencies and build settings are
preserved. Node 24 is needed only by maintainers running Oxlint RuleTester tests.

## Storage contract

The installed skill contains instructions, runtime source, and locked toolchain
metadata. **Initialization, search, and analysis never write inside it.**

The default layout at the project root is:

| Path | Purpose | Version control |
| --- | --- | --- |
| `.510/config.json` | Storage choice and optional analysis settings | Commit portable settings |
| `.510/toolchains/<fingerprint>/` | Installed dependencies | Ignore |
| `.510/cache/fff/` | Search ranking/history databases | Ignore |
| `.510/reports/` | CLI reports and MCP run reports | Ignore |
| `.510/tmp/` | Temporary analysis configurations and rule copies | Ignore |
| `.510/specs/` | Durable specifications from `510 spec` | May be committed; no generated ignore rule |
| `.510/debug/` | Reproductions and evidence from `510 debug` | Ignore |
| `.510/mcp.json` | Connection with machine-specific absolute paths | Ignore |

`init` adds the generated paths to `.510/.gitignore`, preserving existing entries.
A custom or shared storage root contains `toolchains/<fingerprint>/` and
`projects/<project-id>/{cache,reports,tmp,specs,debug}/`. Projects can share identical
installed dependencies while keeping their search data, reports, temporary files,
and workflow artifacts separate. Configuration and the connection file remain at the project’s
`.510/` directory. Avoid committing machine-specific absolute storage paths;
project mode and relative custom paths are portable.

Use `510 paths --root /project` or the MCP `paths` tool to resolve spec and debug
destinations without installing dependencies, creating directories, or changing
settings. Follow [workflow storage](workflow-storage.md) for naming and retention.
Directories are created only when the workflow has content to save. Existing
ignore rules are preserved, including ignored shared/custom project-data trees.

The fingerprint includes the bundled manifest and lockfile, Bun version, OS, and
architecture. A changed toolchain installs into another directory; old versions
remain available. `init` stages installation before switching a repaired directory
into place and prevents simultaneous installation of the same version. An interrupted
`init` can leave a lock; its error names the file. Remove that lock only after
verifying no initialization is still running.

Ordinary analysis cleans its temporary directory on completion or cancellation.
An abruptly terminated process may leave temporary files. Reports persist until
removed; retaining ten MCP jobs in memory does not delete older reports on disk.
The CLI's explicit `--output` can save a report elsewhere, outside the skill.
Tooling configurations supplied by a project may execute their own code.

Example portable configuration:

```json
{
  "version": 1,
  "storage": { "mode": "project" },
  "analysis": {
    "paths": ["src", "tests"],
    "thresholds": { "cyclomatic": 20, "nesting": 4, "cognitive": 15 }
  }
}
```

Existing `.blindfolded.json` analysis settings remain supported when `analysis`
is absent from `.510/config.json`. An explicit `analysis` object takes precedence;
the two are not merged. Old `.blindfolded/` reports and caches from earlier skill
installations are left intact; new runs use the configured storage.

## Readiness and connection

```sh
bun <skill-directory>/scripts/510.mjs doctor --root /path/to/project
```

Doctor reports paths, Bun and dependency versions, and native FFF loading.
Missing dependencies or unsupported native platforms fail readiness. Runtime
loading requires the installed pinned package; a global cache cannot substitute
for a missing tool. Only `init` installs dependencies. Native FFF and its platform
package use the same locked installation as the MCP SDK and analyzers.

`init` saves `.510/mcp.json` with an absolute Bun executable, server entrypoint,
and repository root. Generate the same configuration without installing anything:

```sh
bun <skill-directory>/scripts/510.mjs mcp-config --root /absolute/project
```

Use those command and arguments in the selected agent's MCP configuration.
Clients using `mcpServers` JSON can use the saved entry directly; other clients
use their own configuration format. Merge with existing configuration. Register
an agent only when that integration is requested or already authorized. `init`
prepares the connection without registering it or claiming the agent is connected.

Reconnect after updating the skill or changing storage. Verify tool discovery
and a search in the actual agent before reporting connection readiness. To launch
the stdio server directly, use `bun <skill-directory>/scripts/510.mjs serve --root
/project`; it waits for MCP messages. Protocol traffic alone uses stdout.

## Search and analysis

FFF initializes its repository index on first search. It supports literal OR
patterns, path constraints, and pagination without following directory symlinks.
Ignored, binary, and oversized files may be excluded. Search is navigation
evidence; the analysis suite establishes its own source coverage and excludes
510's generated storage.

The tools are `doctor`, `paths`, `guide`, `find_files`, `search`, `analyze`, and
`analysis_result`. Guides are also available as resources. `analyze` starts all
five analyzers and returns an id; an overlapping request returns the active id.
Poll `analysis_result` with a delay and retrieve all findings pages and gaps.
Full reports default to `.510/reports/runs/<id>.json`. Closing the server cancels
unfinished checks and retains partial results. Completed status does not imply
success. The last ten jobs are available in memory until restart.

The CLI uses the same engine:

```sh
bun <skill-directory>/scripts/510.mjs analyze --root /path/to/project
```

Its default report is `.510/reports/report.json`. Every finding and missing
required coverage blocks success. Report installation readiness, agent connection,
and analysis outcome separately. See [analysis](analysis.md) for detailed limits.

## Updates

Update the installed skill through its original installer, then rerun **510 init** for the project and reconnect MCP. Settings and runtime data live outside
the replaced skill. The saved configuration is reused and dependency installation
is skipped when its fingerprint is unchanged. Stop active analysis before changing
storage. Changing storage selects a new location; it does not move or delete
existing reports, caches, toolchains, specs, or debug evidence.

Maintainers update exact versions and both committed Bun lockfiles, verify the
runtime and full suite, and regenerate the installable bundle. Normal initialization never
selects newer dependency releases. Preserve upstream licenses and attribution.
