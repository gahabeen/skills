# Pstack playbooks: exploratory comparison

2026-09-10. Source revision: `df3fb154fb982fb83f649de8646d4af6a0cb16b3`.
This note supports discussion; it does not approve a new skill or workflow.

## What is distinctive?

| Playbook | Distinctive practices | Cost and possible transfer |
| --- | --- | --- |
| [Perf issue](https://github.com/cursor/plugins/blob/df3fb154fb982fb83f649de8646d4af6a0cb16b3/pstack/skills/poteto-mode/playbooks/perf-issue.md) | Baseline and post-fix traces from the relevant runtime surface; parse and compare artifacts; inconclusive evidence cannot pass. Eight strategy families generate hypotheses only when evidence warrants them: elimination, divide and conquer, caching, indirection, batching, redundancy, lazy evaluation, scheduling. Elimination additionally requires architectural understanding; a profiler cannot establish that work is unnecessary. Scheduling must improve interactive latency, not merely total work. | Depends on control skills, `how`, conditional `architect`, a delegated implementer, a sequencing principle, and PR opening. Transfer the measurement contract and evidence-conditioned hypotheses into debugging before adding a separate entrypoint. |
| [Bug fix](https://github.com/cursor/plugins/blob/df3fb154fb982fb83f649de8646d4af6a0cb16b3/pstack/skills/poteto-mode/playbooks/bug-fix.md) | Reproduce and verify through the same user-facing surface; confirm the causal mechanism at runtime. Select experiments that eliminate the largest remaining hypothesis set. Revert speculative changes when evidence refutes them. Commit the failing reproduction before its fix when a cheap local test exists. | Depends on control, `how`, history-oriented `why`, conditional `architect`, delegated implementation, and PR opening. The transferable delta is disciplined hypothesis elimination and removing unsupported changes; reproduction, root cause, fix, and verification are otherwise a familiar debugging loop. |
| [Feature](https://github.com/cursor/plugins/blob/df3fb154fb982fb83f649de8646d4af6a0cb16b3/pstack/skills/poteto-mode/playbooks/feature.md) | Name the data shape and organizing structure before logic. Make design decisions explicit. A four-part checkpoint identifies blocking prerequisites, independent work, shared mutable state, and the smallest safe decomposition. One owner coordinates coupled work. | Requires design exploration or an explicit skip, retains nonapplicable checkpoint items with explanations, mandates delegation and sometimes an `arena` comparison, then surface verification, ordered commits, and PR opening. Transfer the checkpoint only when coordination is a real problem; the full playbook mainly prescribes an orchestration style. |

## More distinct candidates

[Hillclimb](https://github.com/cursor/plugins/blob/df3fb154fb982fb83f649de8646d4af6a0cb16b3/pstack/skills/poteto-mode/playbooks/hillclimb.md)
adds a sustained experiment protocol: realistic workload dimensions, a harness
that distinguishes easy and problematic cases, repeated samples, a frozen
measurement method, correctness gates, one hypothesis per attempt, and a
keep-or-revert log. These address measurement integrity more specifically than
the task label “perf issue.” Its mandatory delegated attempts, minimum-attempt
stop predicate, and plateau-pushing need a budget and stopping judgment; they
should not become defaults for a small regression.

[Eval](https://github.com/cursor/plugins/blob/df3fb154fb982fb83f649de8646d4af6a0cb16b3/pstack/skills/poteto-mode/playbooks/eval.md)
tests whether instructions change agent behavior. Candidates receive organic
requests in sanitized environments; the rubric stays with a blinded judge;
variant comparisons use one scoring scale. Transcripts and output behavior
provide evidence, rather than claims that instructions were followed. The
upstream requires multiple models, `arena`, and Cursor transcript access.
A local adaptation could retain the experimental discipline without those
specific dependencies.

## Working judgment

The [current architecture](../adr/0003-one-skill-shared-runtime.md) deliberately
uses one public 510 skill with task-specific guides. Any addition should first
be considered as guidance within that bundle.

- [Debug](../../guides/debug.md) already covers reproduction, hypothesis testing,
  regression fixes, baseline timings/profiles, and verification on the original
  scenario. `bug-fix` would duplicate that outcome. Performance guidance could
  make workload selection, repeated measurements, noise, and tradeoff checks more
  explicit without adding a separate workflow.
- [Implement](../../guides/implement.md) already covers feature delivery from a
  selected spec or tickets, tested slices, standards/spec review, and a local
  commit. One question remains open: whether a clear, small request in the
  conversation should suffice as its contract, without a separate saved spec.
  That is a possible change to the existing entry conditions, not evidence that
  a new `feature` workflow is needed.
- The guides examined establish no behavioral evaluation protocol for proposed
  instructions. A small experiment comparing the existing workflow with a
  proposed addition could test whether that addition earns its maintenance and
  execution cost. This comparison has not been run.

The names `feature` and `bug-fix` do not by themselves establish missing
capabilities. Compare their observable outcomes with existing guides before
adding routes. A narrow measurement protocol has a clearer potential gap than
a new generic performance workflow. An instruction-evaluation protocol offers
another useful test: compare representative tasks with and without proposed
guidance, then retain only instructions that improve results enough to justify
their added context, coordination, and execution cost. This is a recommendation
from the comparison, not a claim that such improvement has been measured.
