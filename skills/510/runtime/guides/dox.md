# Maintain the AGENTS.md hierarchy

Keep a useful hierarchy of `AGENTS.md` files: project rules at the root and local
contracts beside the areas they govern. Use this read-and-update loop during
510's authorized editing workflows. During **510 init**, initialize or refresh
the hierarchy in the selected project. On later edits, maintain only the affected
boundaries. Honor a user-selected subtree or documentation-only scope.

When authoring or revising instructions, apply [writing for agents](writing-for-agents.md)
to their structure and references. Preserve the hierarchy and maintenance contract below.

## Read the applicable chain

Read the root `AGENTS.md`, then every applicable `AGENTS.md` along the path to
each area you expect to change. Follow child indexes, but also check the actual
ancestor directories: an incomplete index must not hide local instructions.
For moves, read both the old and new paths. Read additional chains when the work
expands, and reread documents changed since you inspected them in this session.

Parent instructions govern shared concerns; nearer documents supply local
details under the harness's instruction-precedence rules. DOX does not override
user instructions or grant permission for unrelated work. Reviews and
diagnosis-only requests may report documentation gaps without editing them.

## Initialize or repair the hierarchy

During `510 init`, inspect existing instructions, the directory structure,
and representative source, configuration, and checks within the selected scope.
Use repository search where available. Exclude generated output, dependencies,
caches, and vendored trees from new documentation; document their ownership at
the maintained boundary instead. Honor canonical sources and generation rules.
If discovery is incomplete, describe the gap instead of claiming full coverage.

Merge into existing `AGENTS.md` files, preserving unrelated rules and the local
format. Create a child only where a stable boundary has distinct responsibilities,
contracts, or workflow that would otherwise burden the parent. A small project
may need only the root file. Reuse existing hierarchy and index sections on
repeat runs; do not create a document for every folder or duplicate an index.

The root keeps project-wide guidance and a linked index of its direct child
documents. Each child explains its scope, what it owns, and its own direct
children. “Direct child” means the next documented boundary, even if intermediate
directories have no `AGENTS.md`. Index links are relative to the owning document,
name the child's scope, and point to real files. State what remains parent-owned.
For scoped work, update ancestor indexes only as needed to keep it reachable.

Use purpose, ownership, local contracts, work guidance, verification, and child
index sections when useful. Record only established guidance and real checks;
omit empty sections rather than inventing commands, standards, or requirements.
Link existing domain docs and decision records instead of copying their contents.
Keep specs, investigation notes, and progress logs in their existing workflow
storage, outside the instruction tree.

When initializing, include concise maintenance guidance in the root so the
hierarchy remains usable without 510: read the applicable chain before editing;
update affected contracts after meaningful changes; keep child indexes current;
verify changed links and documented checks. Write it in the project's style,
without installing a separate skill or requiring future 510 invocation.

## Maintain after changes

Before finishing authorized edits, check whether purpose, ownership, interfaces,
inputs/outputs, side effects, durable workflows, or verification changed. Update
the nearest owning document and any affected parents or children. Create a
missing document only when the changed boundary needs durable local guidance;
ordinary edits do not require initializing the entire project hierarchy.

Record a user's explicitly durable project preference at the relevant scope.
Keep one-task exceptions and unresolved proposals out of permanent instructions.
Delete obsolete statements and update links after moves, renames, or deletions,
while preserving rules and content that still apply. Keep shared guidance in
parents and concrete exceptions or local contracts in children.

Verify the affected indexes against actual paths and scopes, and check documented
commands against existing tooling. Run relevant repository-required verification;
reuse current results where the content has not changed. Report which docs changed,
or briefly explain why existing docs still describe the work. A behavior-preserving
edit can leave them unchanged. `AGENTS.md` maintenance is an agent assessment,
not an automated Blindfolded analyzer or proof of successful static analysis.

CLI `guide dox`, MCP `guide` with `topic: "dox"`, and resource
`five-ten://guides/dox` return these instructions; the agent performs the work.
Reading the guide requires no project initialization and creates no files.
Project instruction files stay beside their governed source, not in `.510/`
or the installed skill. The CLI `init` prepares storage/tooling and returns this
guide as a required agent step; it does not generate project-specific instructions
or verify the hierarchy itself. Report tooling readiness and documentation
completion separately, including any discovery or verification gaps.

Adapted from Agent Zero's DOX framework; see [source and license](upstream/agent0ai-dox/UPSTREAM.md).
