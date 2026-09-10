# Design useful module interfaces

Apply this guidance when a refactor, spec, or bug fix requires a design choice.
Ground the choice in actual callers, ownership, dependencies, and verification
needs. Use the project's domain vocabulary; these terms describe the design:

| Term | Meaning |
| --- | --- |
| Module | A unit with an interface and an implementation, at any useful scale. |
| Interface | Everything callers must know: inputs, outputs, invariants, ordering, errors, configuration, and relevant performance behavior. |
| Depth | How much useful behavior callers can access for the interface they must learn. |
| Seam | A place where behavior can be varied without editing the code that uses it. |
| Adapter | An implementation that satisfies an interface at a seam. |
| Locality | How well related knowledge, changes, bugs, and verification concentrate in one place. |

## Make callers' work simpler

A deep module hides substantial behavior behind a small, coherent interface.
Depth is not a ratio of code lines: a larger body does not make a module better.
Examine real usage to find repeated knowledge, fragile ordering, or implementation
details leaking into callers. Ask whether the module owns that complexity or
merely forwards it elsewhere. Removing a useful module would force its callers
to reimplement what it currently hides.

Choose an interface that expresses the domain operation, including failure and
lifecycle rules. Compare caller code before and after the proposal. Keep cohesive
responsibilities together; splitting a function to lower a metric is not itself
an improvement. A straightforward function may be sufficient. Do not add a port,
factory, or adapter solely for hypothetical future variation.

## Place test seams deliberately

Test behavior through the interface used by callers where that reaches the real
contract. Keep internal seams private when callers do not need them. Accept or
otherwise control dependencies such as clocks, transport, or storage when doing so
solves an observed testability or design problem. Avoid replacing whole modules
just to reach their internals.

| Dependency | Useful test approach |
| --- | --- |
| In-process computation or owned memory | Exercise the behavior directly through the interface. |
| Local dependency with a faithful stand-in | Use the stand-in where appropriate; retain checks for production-specific semantics. |
| Remote service owned by the project | Define the required transport contract; test logic with a controllable adapter and verify the real integration. |
| External service | Isolate the operations actually used; exercise controlled responses and verify the adapter against the external contract. |

Production and test adapters can justify a seam, but adapter count is not a proof
of good design. Avoid exposing internal configuration just because a test needs
control. Assert observable results, errors, ordering, and effects rather than a
particular arrangement of helpers.

Local mutation of freshly owned state can be appropriate. Establish ownership
before describing an effect or proposing immutable copies; consult
[effects and testability](effects-and-testability.md). Returning data is useful
when it clarifies the contract, not a universal ban on procedures or I/O.

## Compare alternatives when the choice matters

For an uncertain interface, sketch at least two materially different options:
for example, the smallest operation surface and the easiest common caller. Show
the caller contract, an example use, what the implementation hides, the dependency
strategy, and the tradeoffs. Compare depth, locality, and seam placement and give
a recommendation. Explore directly or use bounded delegated design when available
and authorized; multiple agents are not required.

When consolidating modules, establish behavior coverage at the chosen interface
before removing older tests. Retain distinct regression and adapter coverage;
delete a test only when it no longer covers a needed contract or its coverage is
demonstrably replaced. Preserve behavior and migration compatibility. For an
authorized refactor, follow the [refactoring workflow](refactor.md) and its complete
verification contract; a spec or design discussion does not itself request changes.

Adapted from Matt Pocock's `codebase-design`, `DEEPENING.md`, and `DESIGN-IT-TWICE.md`;
see [source and license](upstream/mattpocock-skills/UPSTREAM.md).
