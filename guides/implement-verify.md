# Verify both the code and the spec

Run the full relevant test suite and repository-required checks at the end. For
JavaScript/TypeScript work, follow the complete [510 review](review.md), including
all static analyzers, contextual findings, and coverage gaps. Runtime tests remain
separate from the static-only `analyze` command. Reuse still-current check results;
rerun affected verification after further edits.

Review the selected change against the captured starting state, including staged,
unstaged, and new files. A committed-HEAD-only diff can miss the implementation.
Keep two assessments distinct:

- **Standards:** check documented repository constraints and the evidence from
  510 review, plus the five coding rules for changed code. Investigate unclear
  naming, repeated knowledge, speculative abstractions, and leaking implementation
  details as contextual signals.
- **Spec:** map every in-scope acceptance criterion to implemented behavior and
  evidence. Identify omissions, incorrect behavior, and unrequested additions.

Perform both passes directly, or delegate separately when available and authorized.
Passing one does not excuse failing the other. Fix supported problems within scope
and repeat affected checks and review. All remaining findings and incomplete
required checks block successful completion and the commit; preserve partial work
and report a blocker that requires access, a decision, or unrelated changes.


Load [finish](implement-finish.md) only after required checks and both assessments pass.
