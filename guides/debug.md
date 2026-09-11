# 510 debug

Apply the shared [output guidance](output.md) to user-facing replies and authored prose.

Diagnose the reported bug or performance regression through a reproducible feedback
loop, then fix and verify it within the user's requested scope. Use the description
after `510 debug`, or the current report. Read relevant repository instructions,
glossary entries, decision records, and the working-tree state. Preserve unrelated
changes. A diagnosis-only request stops at the supported cause and proposed fix.

Prefer the harness's native editing tools for authored changes, and review the
resulting diff before continuing.

For authorized fixes, follow [DOX documentation maintenance](dox.md): read the
applicable `AGENTS.md` chain before editing and update affected contracts and
indexes before final verification. Diagnosis-only work reports relevant gaps.

Apply the [coding rules](codebase-design.md#coding-rules) to code added or changed
during the investigation and fix, including verification through public package
entrypoints when their exports or build output change.

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
For a slowdown, establish the performance baseline below before changing behavior.

If the environment is inaccessible, preserve attempts and identify the specific
access or artifact needed. Separate tentative leads from findings and say the bug
is not reproduced. Use a documented human-assisted step only when the agent cannot
perform it. Do not claim a diagnosis from inspection alone or add production
instrumentation without authorization.

## Establish comparable performance measurements

For a slowdown, name the operation the user experiences, the metric and unit, and
the workload that reproduces the complaint. Include relevant data size, state,
and concurrency. Measure the affected path: moving work into a queue may reduce
request time while leaving completion latency unchanged. Where available, compare
with a known-good revision or an easier workload to check that the measurement
detects the difference. If it cannot, improve the reproduction before optimizing.

Reuse an existing benchmark or make the reproduction repeatable. Record the
revision/build, runtime and hardware, inputs, concurrency, cache state, warmup,
and command or procedure needed to repeat it. Keep those conditions comparable
before and after a change. Measure cold and warm behavior separately when both
matter. Include setup only when it belongs to the operation being measured.
Fix the measurement method before trying a change; if it changes, rerun the
baseline as well. Use profiles to locate costs and timings to quantify the
effect on the affected operation.

Repeat baseline and candidate runs with the same sampling and summary method.
Choose a summary that reflects the complaint, such as median latency for typical
requests or a tail percentile for stalls. Report sample counts and observed
variation; tail percentiles need enough samples to be meaningful. When conditions
drift, interleave baseline and candidate runs where practical. Retain raw results,
including failures, and explain any exclusions. A single best run or a difference
within observed noise does not establish an improvement. Use an existing target
when specified; distinguish a measurable gain from resolving the user's complaint.

Test one supported hypothesis at a time and rerun the same workload after each
attempt. Preserve correctness checks and measure relevant tradeoffs such as memory,
CPU, throughput, errors, or deferred work. Check other affected workloads when an
optimization shifts cost, including first use and invalidation for caching. Keep
a performance change only when the improvement is repeatable beyond observed
noise and behavior and adopted resource limits still hold. Revert only the
unsupported changes from that attempt, preserving unrelated work.

Record the baseline, candidate result, absolute and percentage change where
defined, variability, tradeoffs, verdict, and artifact paths in `diagnosis.md`.
Report inconclusive evidence as unresolved. Stop when the reported problem is
resolved or further useful measurement exceeds the task's scope or available
budget; record the limitation rather than weakening the success criterion.
Retain a runnable benchmark when useful. Add timing thresholds to CI only when
the benchmark conditions and an adopted performance budget make them reliable.

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
measurement and acceptance criteria above; for an intermittent bug, compare
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
Performance measurement guidance is informed by Pstack's
[Perf issue](https://github.com/cursor/plugins/blob/df3fb154fb982fb83f649de8646d4af6a0cb16b3/pstack/skills/poteto-mode/playbooks/perf-issue.md)
and [Hillclimb](https://github.com/cursor/plugins/blob/df3fb154fb982fb83f649de8646d4af6a0cb16b3/pstack/skills/poteto-mode/playbooks/hillclimb.md)
playbooks, adapted as measurement guidance within the existing debug workflow.
