# DOX provenance

Source: [agent0ai/dox](https://github.com/agent0ai/dox), revision
[`765ae4ac02cc884eefcd41a3d0f71941721adb89`](https://github.com/agent0ai/dox/tree/765ae4ac02cc884eefcd41a3d0f71941721adb89),
retrieved 2026-09-10. Adapted upstream `AGENTS.md` into [documentation maintenance](../../dox.md)
and the shared read-before-edit/update-after-change guidance in 510.
Copyright (c) 2026 Agent Zero. The original MIT license is preserved verbatim in
[LICENSE](LICENSE) and included in the installed bundle.

## Intentional adaptations

- Integrated DOX into `510 init` and ongoing edits in the single explicit-only
  510 skill, with a shared guide, MCP topic, and resource. No separate workflow
  command, package, or runtime dependency. CLI setup returns the guide for the
  agent to complete, without pretending to generate or verify project docs.
- Retained ancestor traversal, local ownership, stable contracts, child indexes,
  and a documentation pass after meaningful changes. Check actual ancestors as
  well as indexes, and inspect both paths when moving files.
- Scoped whole-tree initialization to `510 init` or a documentation request. Routine
  editing maintains affected boundaries; read-only workflows report gaps without
  writing. Preserve existing content and reuse the hierarchy on subsequent runs.
- Respect host instruction precedence and user scope rather than treating DOX as
  unconditionally overriding other instructions. Keep 510's explicit invocation
  policy and deterministic toolchain setup intact.
- Use the project's existing document shape and omit unsupported empty sections.
  Avoid generated, dependency, cache, and vendored trees; preserve canonical-source
  rules. Keep domain records and temporary workflow evidence in their own locations.
- Keep root maintenance guidance self-contained when initializing a project,
  without copying the upstream instruction to scan everything before continuing.
  Distinguish agent documentation review from automated static-analysis coverage.
- Linked 510's internal writing-for-agents guide for instruction structure and
  conditional references while retaining DOX's hierarchy and maintenance contract.

This is a maintained adaptation. Edit canonical `guides/` and regenerate the
installed bundle with `bun run sync:skill`.
