# Blindfolded findings

The shared language for describing code observations and deciding what they
justify during a Blindfolded review.

## Language

**Finding**:
A supported observation about code, classified as Fix, Enforce, or Review.
Its classification expresses what the evidence justifies.
_Avoid_: Quality score, automatic defect verdict

**Fix finding**:
A demonstrated defect or broken contract with an explainable consequence.
_Avoid_: Style preference, complexity warning

**Enforce finding**:
A violation of an explicitly adopted design or coding constraint, including
its intentional exceptions.
_Avoid_: Universal best practice, unagreed policy

**Review finding**:
A signal that calls for contextual investigation before a change is justified.
_Avoid_: Proven defect, automatic refactor instruction

**Effect description**:
A scoped account of a function's reads, writes, external operations, and
unresolved calls, including the limits of any purity conclusion.
_Avoid_: Purity proof, mutation ban

**Analysis run**:
The default assessment of both defect risks and structural/testability concerns
using all supported static checks, without per-tool opt-ins.
_Avoid_: Selected-tool mode, runtime exercise

**Static analysis**:
Inspection of source and project metadata without running the application or
its tests. Tooling configuration may be evaluated to discover analysis settings.
_Avoid_: Application startup, runtime profiling, build execution

**Successful analysis**:
An analysis run in which all required checks completed and no findings remain.
Fix, Enforce, and Review findings all prevent success without changing what
their classifications mean.
_Avoid_: Partial pass, clean result with skipped required checks

## Product structure

**510**: The public working-mode skill and local toolchain, installed as one bundle.
The skill supplies workflow instructions; its MCP server and CLI expose shared
capabilities. Installation readiness, MCP connection readiness, and analysis
success are distinct outcomes.

**Blindfolded**: 510's complete static-analysis capability and custom Oxlint rule
namespace. Its contracts above remain unchanged by transport or packaging.

**Guide**: Task-specific instructions loaded from the bundled Markdown or through
MCP. A guide does not execute analysis or prove that verification happened.

**Search**: FFF-backed repository navigation. Its index and ranked results do not
define or prove complete analysis coverage.

**Project initialization**: Tooling setup and the agent's AGENTS.md hierarchy pass
performed by `510 init`. The CLI prepares storage and a connection, then returns
documentation guidance for the agent; toolchain readiness does not verify docs.
Portable settings live in `.fiveten/config.json`; generated data defaults to `.fiveten/`
and can move to shared or custom storage. The installed skill remains read-only.

**Toolchain fingerprint**: The manifest, lockfile, Bun version, and platform
identity selecting an isolated dependency installation. It is not a project
identifier; projects sharing a toolchain keep separate search and report data.
