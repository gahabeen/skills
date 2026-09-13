# Measure a performance regression

Use this reference for slowdowns investigated through [510 debug](debug.md).

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

Performance measurement guidance is informed by Pstack's
[Perf issue](https://github.com/cursor/plugins/blob/df3fb154fb982fb83f649de8646d4af6a0cb16b3/pstack/skills/poteto-mode/playbooks/perf-issue.md)
and [Hillclimb](https://github.com/cursor/plugins/blob/df3fb154fb982fb83f649de8646d4af6a0cb16b3/pstack/skills/poteto-mode/playbooks/hillclimb.md)
playbooks, adapted as measurement guidance within the existing debug workflow.
