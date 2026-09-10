# Implement five coding rules in 510

Source: the five proposals in this conversation, accepted by the user's
"510 implement those 5 rules in 510" request on 2026-09-11.
Starting state: clean `main` at `6815bc2`.

## Acceptance criteria

- Explain exported functions, types, interfaces, and non-obvious internal helpers.
- Reuse or derive data contracts from their authoritative owner.
- Validate at trust boundaries without speculative internal coercions or fallbacks.
- Search for existing helpers and place shared behavior with its narrowest owner.
- Verify changed exports and build output through public consumer entrypoints.
- Make all five rules discoverable from the skill and applicable editing workflows.
- Preserve explicit invocation, repository-specific contracts, licenses, and the
  distinction between agent guidance and automated analysis.

## Progress

The design guide owns the five rules; the skill, implementation, debug, and
refactor guides link to them. Implementation review includes them for changed code.
Upstream provenance identifies the rules as local additions. The separate proposal
to detect conflicting project instructions is outside these five accepted rules.

## Verification

- Regenerated the installed bundle with `bun run sync:skill`.
- `bun run check` completed successfully: 396 rule tests, 43 integration tests,
  typechecking, skill validation, and bundle consistency. Seven existing complexity
  warnings remain in unchanged analyzer code; no static-analysis success is claimed.
- Standards review: authored changes use canonical guides and native patches;
  generated copies match; invocation policy, licenses, and runtime behavior remain
  intact. No in-scope findings remain.
- Acceptance review: the five numbered rules cover all five accepted proposals;
  skill and editing-workflow links make them discoverable, and implementation
  review applies them to changed code. Legitimate validation, distinct boundary
  representations, and project-specific contracts remain supported.
- DOX pass: root `AGENTS.md` still describes repository ownership and verification;
  no hierarchy or index changed, so it remains unchanged.

This documentation change uses existing guide delivery, link, and bundle checks
without new tests that assert prose wording. Implementation and verification are
complete; the selected changes are ready for the local commit.
