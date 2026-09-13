# Read and compare analysis reports

Reports use schema version 2, retaining the full analyzer evidence and adding
finding IDs, group IDs, change labels, policy version, and a recorded-configuration
fingerprint. Reader commands accept
older schema version 1 reports too; incomparable evidence is labeled explicitly.

Use `analyze --baseline /path/to/previous.json` or MCP `analyze` with `baseline`
to compare with a saved snapshot. The baseline is read before replacing output.
Matching findings are existing; unmatched findings are introduced only when both
reports have complete checks and matching selected files, recorded analyzer
settings (including thresholds), and policy version. External configuration imports
and dependency contents are not fully fingerprinted. Older reports without the
fingerprint remain incomparable. Otherwise unmatched findings remain uncompared. These labels describe
diagnostic correspondence, not proof of causation or a fix. Every finding still fails.

IDs ignore checkout roots and line shifts but depend on the rule, relative file,
message, related files, and occurrence order. Renames, changed messages, or inserting
an identical diagnostic before another can change IDs. Bump the policy version in
the report builder when changing analysis policy; comparisons do not infer compatibility.

`analyze --grouped` emits a short text summary. Retrieve saved evidence without a
new run using `report REPORT.json --view groups`, then `report REPORT.json --group ID
--offset 0 --limit 50`. Optional `--baseline REPORT.json` compares saved reports.
MCP `analysis_result` accepts `view: "groups"` or `view: "findings"` with `groupId`.
The response reports total findings, selected records, outside-page counts, remaining
records, next offset, separate completeness fields, and `reviewStatus: "not-tracked"`.
Group summaries omit locations; drill down through all pages for the full evidence.
No retrieval marks a finding reviewed or accepted, suppresses evidence, or changes success.

The JSON report includes `success`, selected files and exclusions, thresholds,
per-analyzer status/configuration, findings, coverage gaps, and limitations. Each
finding includes tool/rule identity, classification, location where available,
evidence, uncertainty, and a proposed action. Complexity findings carry measured
values and configured limits. File-level and graph findings may have no line
number; do not invent one.

Keep raw diagnostics and partial findings available. Tool classifications are
initial interpretations; source review may refine them. Never present a warning
as a demonstrated defect merely because it blocks the analysis command.
