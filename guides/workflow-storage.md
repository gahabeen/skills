# Store explorations, specs, and debugging evidence

Resolve the intended project's approved storage before writing workflow artifacts.
Use the connected 510 `paths` tool, or the bundled CLI without installing anything:

```sh
bun <skill-directory>/scripts/510.mjs paths --root /absolute/project
```

The result includes absolute `explorations`, `specs`, and `debug` directories. It reads the existing
`.fiveten/config.json`; if none exists, it resolves the default project-local `.fiveten/`.
It creates no files or directories, changes no settings, and needs no toolchain
installation. Omit `--root` only when normal project discovery selects the intended
project. The MCP server uses its fixed project root.

| Storage choice | Explorations | Specs | Debug sessions |
| --- | --- | --- | --- |
| Project (default) | `.fiveten/explorations/` | `.fiveten/specs/` | `.fiveten/debug/` |
| Shared or custom | `<base>/projects/<project-id>/explorations/` | `<base>/projects/<project-id>/specs/` | `<base>/projects/<project-id>/debug/` |

Use the returned paths; do not reconstruct the project identifier or interpret a
relative custom path against the current working directory. Shared storage keeps
each project's artifacts separate. Reuse the saved choice without asking for it
again. An invalid configuration or an escaping symlink is an error, not permission
to fall back to a different destination. See [toolchain storage](toolchain.md) if
the user requests a change of location.

Invoking `510 explore`, `510 spec`, `510 implement`, or `510 debug` authorizes creating that workflow's local
artifacts under these directories. Create only the needed directory, lazily.
Respect an explicit user destination or an already selected document being revised;
do not move existing artifacts merely to impose the default layout. Never write
inside the installed skill. Do not follow a target-file symlink out of the selected
directory or overwrite another task's artifact.

Explorations use descriptive filenames such as `explorations/offline-mode.md`.
Continue the same document for the same discussion; use a unique suffix for an
unrelated exploration with a colliding name. Respect discussion-only requests.
When an exploration informs a grill or spec, reference it and preserve the
difference between tentative options and accepted decisions. Explorations are
not specifications or candidates for automatic implementation.

Specs use descriptive filenames such as `specs/order-cancellation.md`. Update the
same spec when continuing that work; use a unique suffix for an unrelated spec
with a colliding name. Implementation progress uses `specs/<subject>.implementation.md`,
referencing its source spec or tickets and keeping execution status separate from
requirements. These notes are not candidates when selecting a spec to implement.
Debug sessions use `debug/<subject>-<unique-id>/` with a
`diagnosis.md` and the minimal fixtures or redacted logs needed to resume.

Project-local explorations and specs are durable documents: setup does not add them to its generated
ignore rules. Debug artifacts are local evidence; setup ignores `/debug/`. Existing
ignore choices remain authoritative, and shared/custom `projects/` trees may
already be ignored. Resolving or saving these paths does not itself commit or
publish artifacts; implementation follows its own commit step.
Creating these files before setup does not require running setup or editing ignore
rules. Retain relevant debug evidence on failure; remove only disposable probes
created by the current session. Neither setup nor a storage change moves or deletes
existing explorations, specs, or debug sessions.
