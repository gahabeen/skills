# Test-driven implementation

Use this discipline inside [510 implement](implement.md) when changing behavior
that can be meaningfully tested. Reuse the spec's agreed interfaces and the
repository's existing test conventions. A prior decision needs no new approval.
If a materially different interface is required, explain the tradeoff and resolve
that decision before depending on it; use [codebase design](codebase-design.md).

## Write tests that can disagree with the code

Tests should describe caller-visible behavior through an appropriate interface.
Derive expected outcomes from the spec, a worked example, or another independent
source of truth. Do not calculate the expectation by repeating the implementation.
For example, a total for known prices should assert the independently calculated
amount, not repeat the production summation algorithm in the assertion.

Prefer observing an operation's result through the same interface callers use.
Exercise a created record through its retrieval operation when that is the
contract, rather than asserting on internal storage structure. Errors, externally
observable effects, and ordering belong in tests when the contract requires them;
private helper calls and incidental internal call counts usually do not.

## Use controllable dependencies

Prefer real in-process behavior and realistic local fixtures. Control time,
randomness, filesystem state, and remote responses at an existing interface when
needed. Use focused adapters for external operations rather than replacing whole
internal modules. A test double should express the dependency's contract, not
duplicate its implementation. Keep separate integration or contract coverage where
a stand-in cannot establish production behavior. Introduce a new seam only when
it solves a demonstrated problem.

## Work in vertical slices

1. Select one observable behavior or failure case from the agreed requirements.
2. Write and run a focused test. Confirm it fails because the behavior is missing
   or wrong, not because the fixture or environment is broken.
3. Add enough implementation to satisfy that behavior and run the test again.
4. Repeat with the next behavior, using each result to inform the next slice.

Keep the cycle small; avoid speculative production code or writing all tests
before any implementation. Save broader restructuring for evidence-based review,
with behavior kept green. Run focused tests frequently, typechecking at useful
checkpoints, and the full relevant suite before finishing the implementation.

When no suitable test surface exists, record why and use a meaningful reproduction
or integration check. Do not create tests that merely match wording, private code
shape, or constants to simulate coverage. Documentation and low-impact edits may
need existing validation only. Report unverified behavior as a limitation.

Adapted from Matt Pocock's `tdd`, `tests.md`, and `mocking.md`; see
[source and license](upstream/mattpocock-skills/UPSTREAM.md).
