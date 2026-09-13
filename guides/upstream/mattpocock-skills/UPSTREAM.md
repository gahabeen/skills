# Matt Pocock skills provenance

Source: [mattpocock/skills](https://github.com/mattpocock/skills), revision
[`3cca18b368ae95cdbdebbff572ccafa662551015`](https://github.com/mattpocock/skills/tree/3cca18b368ae95cdbdebbff572ccafa662551015),
retrieved 2026-09-10. Copyright (c) 2026 Matt Pocock. The original MIT license is
preserved verbatim in [LICENSE](LICENSE) and travels with the installed bundle.

The merge-conflict, writing-for-agents, and architecture-improvement sources below
were reviewed on 2026-09-11 at the same revision. The upstream `main` reference
resolved to that revision when these additions were made.

## Adapted sources

Paths below are relative to that pinned upstream revision:

| Upstream source | 510 guide |
| --- | --- |
| `skills/productivity/handoff/SKILL.md` | [handoff](../../handoff.md) |
| `skills/engineering/grill-with-docs/SKILL.md` | [grill](../../grill.md) |
| `skills/productivity/grilling/SKILL.md` | [grilling](../../grilling.md) |
| `skills/engineering/domain-modeling/SKILL.md` | [domain modeling](../../domain-modeling.md) |
| `skills/engineering/domain-modeling/CONTEXT-FORMAT.md` | [domain modeling](../../domain-modeling.md) |
| `skills/engineering/domain-modeling/ADR-FORMAT.md` | [domain modeling](../../domain-modeling.md) |
| `skills/engineering/to-spec/SKILL.md` | [spec](../../spec.md) |
| `skills/engineering/implement/SKILL.md` | [implement](../../implement.md) |
| `skills/engineering/tdd/SKILL.md` | [TDD](../../tdd.md) |
| `skills/engineering/tdd/tests.md` | [TDD](../../tdd.md) |
| `skills/engineering/tdd/mocking.md` | [TDD](../../tdd.md) |
| `skills/engineering/code-review/SKILL.md` | [implementation review](../../implement.md) |
| `skills/engineering/diagnosing-bugs/SKILL.md` | [debug](../../debug.md) |
| `skills/engineering/codebase-design/SKILL.md` | [codebase design](../../codebase-design.md) |
| `skills/engineering/codebase-design/DEEPENING.md` | [codebase design](../../codebase-design.md) |
| `skills/engineering/codebase-design/DESIGN-IT-TWICE.md` | [codebase design](../../codebase-design.md) |
| `skills/engineering/resolving-merge-conflicts/SKILL.md` | [merge conflicts](../../merge-conflicts.md) |
| `skills/productivity/writing-for-agents/SKILL.md` | [writing for agents](../../writing-for-agents.md) |
| `skills/productivity/writing-for-agents/SKILL-MECHANICS.md` | [writing for agents](../../writing-for-agents.md) |
| `skills/engineering/improve-codebase-architecture/SKILL.md` | [architecture improvement](../../improve-codebase-architecture.md) |
| `skills/engineering/improve-codebase-architecture/HTML-REPORT.md` | [architecture improvement](../../improve-codebase-architecture.md) |

## Intentional adaptations

- On 2026-09-13, implementation became a compact router with separate select,
  build, verify, and finish guides. The five local coding rules moved to their
  own reference so ordinary edits need not read the complete design vocabulary.
  Selection, scope preservation, TDD, Standards/Spec review, and local commit
  requirements remain. References are loaded at the phase that needs them.

- Added `510 explain`, inspired by the `zoom-out` skill installed in the Qpaws
  project and attributed there to Matt Pocock's skills. That installed copy was
  inspected on 2026-09-11; it is not asserted to belong to the pinned revision
  above. The independently written guide adds source evidence, a representative
  flow, explicit uncertainty, read-only boundaries, and no-init operation.
  It explicitly resolves applicable repository instructions before interpreting
  source, including read-only requests.

- Integrated the workflows as guides inside the single explicit-only 510 skill.
  `grill-with-docs` becomes `510 grill`; its dependencies are bundled guides.
  Replaced external Skill-tool calls with local links and MCP guide topics.
- Kept handoffs in a unique OS temporary file by default, while honoring an
  explicit destination. Added work-state, authorization, and 510 verification
  context, including incomplete coverage. Kept artifact references, redaction,
  next-session focus, and suggested skills.
- Preserved the interview's decision dependencies, recommendations, and research
  of observable facts. Made round size and question formatting host-appropriate;
  delegation is optional and subject to availability and authorization.
- Scoped the interview to the user's subject and allowed explicit deferral or
  stopping. Existing authorization to implement survives the interview; a grill
  alone authorizes only the discussion and its documents. Removed the blanket
  requirement to obtain confirmation again before already-authorized work.
- Condensed domain modeling and both format references into one guide. Preserved
  lazy document creation, context-map routing, glossary precision, code checks,
  inline documentation, and the three criteria for recording an ADR. Respect
  existing document conventions and distinguish proposals from agreed decisions.
- Adapted `to-spec` as `510 spec`, saving locally in the configured `specs` directory
  rather than automatically publishing an issue. Removed upstream setup and label
  dependencies, reused existing decisions instead of demanding another approval,
  and scaled the template to the actual change. Unresolved decisions remain explicit.
- Linked grill, spec, and handoff to 510's independently authored exploration
  workflow. They reuse exploration findings and references while keeping tentative
  options distinct from agreed decisions and requirements.
- Adapted `diagnosing-bugs` as `510 debug`, retaining reproduction, minimization,
  falsifiable hypotheses, targeted instrumentation, regression testing, and cleanup.
  Evidence uses configured project storage. Replaced the optional shell wizard
  dependency with documented human-assisted reproduction when necessary. Runtime
  reproduction remains separate from 510's static-only analysis command.
- Adapted `implement` as `510 implement`: select a saved spec or tickets, work in
  tested slices, verify, review, and commit locally on the current branch. Reuse
  configured spec storage, keep separate resumable progress notes, and preserve
  explicit no-commit or partial-scope instructions. The commit guide is reused
  with the selected implementation as scope rather than all work in the thread.
- Bundled a condensed TDD discipline and its testing/mocking references. Preserve
  red-before-green, independent expected results, behavioral interfaces, and
  focused feedback loops. Reuse already-agreed test seams without another approval;
  avoid artificial tests for low-impact changes and record real verification gaps.
- Reused 510's complete review contract and the upstream Standards/Spec distinction.
  Capture the starting state before edits and include uncommitted and untracked
  changes in implementation review. Remove issue-tracker setup and mandatory
  sub-agent dependencies; both review assessments still have to pass. Contextual
  design concerns remain evidence-based Review signals under 510's vocabulary.
- Condensed design, deepening, and alternative-interface guidance into one bundled
  guide used by refactor, spec, and debug. Retained interface depth and locality;
  made delegation optional, replaced blanket test deletion with verified replacement
  coverage, and preserved 510's ownership-based interpretation of local mutation.
  Dependency categories guide judgment rather than mandate ports or mocks.
- Added five operator-selected coding rules to the design guide and linked them
  from the skill, implementation, debugging, and refactoring workflows: useful
  comments, authoritative data contracts, validation at trust boundaries, helper
  reuse and ownership, and verification through public consumer interfaces. These
  are local 510 additions, not rules imported from the upstream skills.
- CLI `handoff`, `grill`, `spec`, `implement`, and `debug` print guidance through the shared guide reader; they
  do not fabricate a conversation transcript or perform the agent's workflow.
- Added `510 merge conflicts` as an agent workflow. Retained intent research,
  reconciliation, required checks, and completion of the active merge or rebase.
  Replaced blanket staging with scoped resolutions and preservation of unrelated
  index/worktree changes. Account for rebase stage labels and non-text conflicts.
  For unrelated unstaged edits blocking continuation, require verified backup,
  overlap inspection, and restoration rather than concealing dirty index entries.
  Honor explicit stop/abort or resolve-only instructions and retain resumable work
  when a decision or required check blocks completion. Guide retrieval is read-only.
- Adapted writing-for-agents as internal document guidance, linked from output and
  DOX. Retained conditional references, information hierarchy, completion evidence,
  co-location, and pruning. Kept 510's explicit invocation policy and plain bundled
  guides instead of importing host-specific claims about skill discovery.
- Adapted architecture improvement as an internal guide for explore, review, and
  refactor. Retained history-informed inspection, concrete friction, caller and
  test benefits, candidate comparisons, recommendation strength, and ADR context.
  Reused bundled design, exploration, grilling, and domain-modeling guides. Removed
  mandatory delegation and fixed transitions. The caller retains its coverage,
  authorization, and document contract. Visual reports are optional, self-contained,
  and offline-capable rather than requiring the upstream CDN-based scaffold.

These files are maintained adaptations, not unmodified upstream copies. Change
the canonical `guides/` files and regenerate the skill bundle with `bun run sync:skill`.
