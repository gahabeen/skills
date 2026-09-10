# Effects and structural testability

Use this during contextual review after reading the automated report. Inspect
relevant functions, their call sites, dependency seams, and ownership. These
observations come from source inspection; the command does not infer whole-program
purity or produce an overall testability score.

## Record scoped evidence

For each function worth investigating, record:

- **Location and scope:** function and source line; inspected callees and files.
- **Inputs and reads:** arguments, captured state, storage, clock, randomness,
  environment variables, and getters whose behavior is known.
- **Writes and ownership:** local variables, freshly allocated objects, arguments,
  shared state, persistence, network requests, emitted events, and logs.
- **Outputs and observations:** return values, errors, callbacks, events, and
  externally visible effects through which behavior can be checked.
- **Coordination:** branches, awaits, callbacks, retries, cancellation, concurrency,
  and ordering assumptions that affect controllability or observability.
- **Uncertainty:** uninspected imports, dynamic calls, aliasing, getters, proxies,
  callbacks, or ownership that cannot be established from the inspected scope.

Use only fields supported by inspected source, and cite locations for conclusions.
An imported call is not automatically pure or impure. A dependency with a clear
interface can be easier to control without replacing its module at runtime.

## Interpret the evidence

| Description | Required evidence |
| --- | --- |
| Pure within the inspected scope | Depends only on inputs and has no externally observable effects; relevant callees and ownership have been inspected. |
| Observer | Reads external state without observable writes. Its result can depend on more than arguments. |
| Procedure | Produces observable effects, such as I/O or mutation of caller-owned/shared state. This can be appropriate. |
| Uncertain | A relevant dependency, operation, or ownership relation remains unresolved. State the missing evidence. |

Local mutation is not itself a finding. A fresh accumulator that never escapes
until return can be locally mutated in an otherwise pure computation. Conversely,
a locally named variable may alias a caller's object. Establish ownership before
recommending a copying or mutation change.

For testability, explain a concrete obstacle and its consequence: hidden time
makes a result uncontrollable; an unobservable event leaves success ambiguous;
an awaited callback creates an ordering requirement; mixed I/O and branching may
require a narrower dependency seam. Complexity is supporting evidence, not an
automatic instruction to extract more functions or interfaces.

## Hand back a contextual finding

```text
Location: src/renewal.ts:42, scheduleRenewal
Inspected scope: function body and the injected clock interface
Reads: subscription input; clock.now()
Writes: local deadline variable
External operations: enqueue(deadline)
Unknown: queue delivery behavior was not inspected
Description: procedure within this scope
Testability concern: delivery success is not returned or otherwise observable here
Classification: Review
Next investigation: inspect the enqueue contract and its callers before changing the interface
```

A normal effect description need not be a finding. When it establishes a defect,
an agreed-policy violation, or a supported review concern, include it in the
overall findings and unsuccessful review outcome. Keep it explicitly attributed
to contextual source review, alongside the command's automated results.
