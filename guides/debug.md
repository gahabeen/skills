# 510 debug

Apply the shared [output guidance](output.md) to user-facing replies and authored prose.

Diagnose the reported bug or performance regression through a reproducible feedback
loop, then fix and verify it within the user's requested scope. Use the description
after `510 debug`, or the current report. Read relevant repository instructions,
glossary entries, decision records, and the working-tree state. Preserve unrelated
changes. A diagnosis-only request stops at the supported cause and proposed fix.

For authorized fixes, maintain affected documentation; use [DOX](dox.md) when
project instructions or their hierarchy need work. Diagnosis-only work reports gaps.

Apply the [coding rules](coding-rules.md) to code added or changed
during the investigation and fix, including verification through public package
entrypoints when their exports or build output change.

When reproduction or verification depends on runtime or framework behavior,
inspect the selected package with `profile` and use only relevant
[environment guidance](environment.md). Use [output guidance](output.md) when
delivering the diagnosis and verification evidence.

Use [workflow storage](workflow-storage.md) for a unique session directory under
the resolved `debug` path, defaulting to `.fiveten/debug/<subject>-<unique-id>/`.
Keep a concise `diagnosis.md` with the symptom, reproduction, hypotheses, evidence,
cause, fix, and remaining checks. Create fixtures or logs only when needed. Redact
credentials and sensitive personal data before saving or displaying evidence;
reference environment-variable names instead of embedding secrets in commands.

## Build a feedback loop that detects this bug

Define expected behavior and the precise observed failure. Construct the smallest
practical command or procedure that exercises the real failing path and distinguishes
that symptom from unrelated failures. Options include an existing test, a focused
integration fixture, a local CLI or HTTP replay, a browser check, a minimal harness,
or comparison with a known-good revision. Read source as needed to construct it.

Run the loop and record its failing result before treating a cause as established.
Make it fast and controlled: pin inputs, time, randomness, and relevant environment
where possible. For intermittent failures, measure reproduction frequency and use
repeated runs or controlled stress; one passing run does not demonstrate a fix.
For a slowdown, use [performance measurement](performance.md) to establish a
comparable baseline before changing behavior.

If the environment is inaccessible, preserve attempts and identify the specific
access or artifact needed. Separate tentative leads from findings and say the bug
is not reproduced. Use a documented human-assisted step only when the agent cannot
perform it. Do not claim a diagnosis from inspection alone or add production
instrumentation without authorization.

## Minimize and investigate

Reduce inputs, callers, setup, and data one element at a time, rerunning the loop
after each reduction. Keep the original failing scenario for final verification.
Stop shrinking when further reductions remove the symptom or defeat the useful
feedback loop.

List a few plausible causes and a distinguishing prediction for each. Rank them
using evidence, communicate the ranking, and test the highest-value prediction.
Use targeted inspection, a debugger, or tagged temporary instrumentation at the
relevant boundary. Change one variable at a time and update the hypotheses after
each result. For regressions with known good and bad states, use bisection when
the loop can reliably decide the outcome. Avoid broad logging or unrelated cleanup.

## Fix at the right interface

Turn the reproduction into a regression test before changing behavior when an
appropriate test surface exists. The test must exercise the actual bug pattern,
including multiple callers, timing, or state transitions when they are necessary.
Use [codebase design](codebase-design.md) and [effects and testability](effects-and-testability.md)
when hidden dependencies or ownership make the behavior hard to control.

If no suitable test surface exists, explain that limitation and retain the runnable
reproduction; do not substitute a shallow test that cannot detect the failure.
Make the smallest coherent fix supported by the evidence. Broader interface changes
need a demonstrated obstacle and must stay within the user's scope.

## Verify and retain the evidence

Rerun the regression test and the original scenario. For a slowdown, apply the
[performance criteria](performance.md); for an intermittent bug, compare
failure rates. Run the repository's required checks. For JavaScript/TypeScript
changes, run 510's complete [static suite](analysis.md) separately and retain all
findings and coverage gaps. A green reproduction does not imply successful static analysis.

Remove only this session's temporary instrumentation and disposable probes, leaving
the regression test and useful reproduction evidence. Record what was actually
verified and which checks remain blocked. Finish with the supported cause, resulting
behavior, verification results, and the saved diagnosis path.

The debug workflow may run tests and the application in an authorized development
environment. The `analyze` command remains static-only and never starts them. The
CLI `debug` command prints this guide; the agent performs the investigation.

Adapted from Matt Pocock's `diagnosing-bugs`; see [source and license](upstream/mattpocock-skills/UPSTREAM.md).
