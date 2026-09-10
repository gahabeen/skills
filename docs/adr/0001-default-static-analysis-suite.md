# Run defect and structural analysis by default

Blindfolded will cover both defect detection and structural/testability analysis
through a default suite of established static analyzers, accepting additional
tooling and configuration cost to obtain broader evidence. Every supported
analyzer participates by default; there are no per-tool opt-ins. The suite
analyzes source and project metadata rather than running the application,
its tests, build scripts, or runtime profiling; evaluating tooling configuration
is permitted so analyzers can discover project settings. CodeQL is excluded from
this version because its separate licensing and distribution requirements would
constrain consumers. The accepted failure policy is recorded in
[success criteria](0002-complete-coverage-and-zero-findings.md).
