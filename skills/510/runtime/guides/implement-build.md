# Implement one behavior at a time

Order the work by dependencies and choose small end-to-end slices that satisfy
observable acceptance criteria. Use the bundled [TDD guidance](tdd.md) where a
meaningful behavioral test is possible, at the interfaces agreed in the spec or
already established by repository practice. Apply the five
[coding rules](coding-rules.md) to each code slice. Use
[design guidance](codebase-design.md) when interfaces or testability need a decision.

Read [DOX](dox.md) when editing project instructions or when the change affects
documented contracts or indexes. Maintain those affected boundaries before verification.

For each slice, run a test that fails for the intended missing behavior, add the
smallest coherent implementation, and rerun the focused tests. Run typechecking
regularly at meaningful checkpoints. Do not write the whole imagined test suite
before learning from the first working slice. For documentation or similarly
low-impact changes, use relevant existing checks instead of manufacturing tests.

Preserve compatibility and adopted constraints. Keep unrelated cleanup out of the
slice; defer broader refactoring to a demonstrated review finding. Use
[debug](debug.md) when a failure requires investigation. Update progress after
meaningful milestones, retaining failures and blocked checks rather than marking
an incomplete criterion done.


Before choosing runtime-specific code or verification, use the read-only project
profile and load only relevant [environment guidance](environment.md). Preserve
the application's package manager and supported runtimes.

Next load [verify](implement-verify.md) after implementing the selected behavior.
