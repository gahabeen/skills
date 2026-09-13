# Coding rules

Apply these rules to the code being added or changed. They do not request a
repository-wide cleanup or edits to generated and vendored code.

1. **Explain exported declarations and non-obvious helpers.** Give exported
   functions, types, and interfaces one short purpose comment. Explain relevant
   ordering, ownership, or side effects when callers need to know them. Comment
   internal pipeline helpers whose role is not obvious; skip tiny private helpers
   that explain themselves. Comments should add meaning beyond repeating the name,
   and stay accurate as the contract changes.
2. **Keep one owner for each data contract.** Reuse or derive types and validators
   from the authoritative definition instead of maintaining parallel declarations
   of the same contract. Put changes in that owning module and use its supported
   exports. Where a boundary intentionally changes the representation, make the
   mapping explicit; distinct wire, storage, or domain contracts need not share
   an identical shape.
3. **Validate where trust changes.** Validate external or untyped input where it
   enters a trusted contract. Within that established contract, avoid speculative
   coercions, repeated guards, and fallback values that conceal broken assumptions.
   For example, do not wrap an already validated string identifier in `String()`
   just in case. Keep checks for real business invariants or changing state, and
   document compatibility handling required by an actual legacy boundary.
4. **Search before adding helpers, then choose their owner.** Look for an existing
   implementation and its callers before adding a utility. Reuse compatible
   behavior through the supported interface. Keep feature-specific logic with its
   feature; place shared behavior in the narrowest owner that serves its actual
   callers. A generic name or a few similar lines alone do not justify a shared
   dependency or combining behaviors that change for different reasons.
5. **Verify the interface consumers use.** When changing package exports or build
   output, verify consumption through the public entrypoint in the relevant runtime
   and distribution form. For example, a package exposing built files needs a
   consumer check against those files; a test importing source directly cannot
   establish that its exports or artifacts work. Use the existing build and test
   workflow, and report unavailable runtime or packaging checks as verification
   gaps. Run these checks separately from static-only analysis.


Use [design guidance](codebase-design.md) only when ownership, interfaces, or test seams
need a design decision. For supported untrusted inputs and narrowing, see
[boundary validation](boundary-validation.md).

Adapted from Matt Pocock's codebase design guidance; see
[source and license](upstream/mattpocock-skills/UPSTREAM.md).
