# ASD-STE100 skill adaptation

Source: [danyuchn/asd-ste100-skill](https://github.com/danyuchn/asd-ste100-skill)
at revision [7d4a135a199a5d7447c4886bcd7ffe742a627bc9](https://github.com/danyuchn/asd-ste100-skill/tree/7d4a135a199a5d7447c4886bcd7ffe742a627bc9).
Reviewed `SKILL.md` and `references/writing-rules.md` on 2026-09-11.

[Output guidance](../../output.md) adapts its sentence structure, terminology,
meaning preservation, and direct-output practices for all 510 workflows.
The adaptation applies to user-facing replies and authored prose, not internal
reasoning, code, structured tool data, or exact diagnostics. Existing workflow
requirements for evidence and verification remain in force.

510 adds its own response structure: scannable sections for substantial replies
and labeled work results with changed files, verification, remaining work, and
references. These additions are local guidance, not STE requirements.

Documents intended for another agent also link to 510's internal writing-for-agents
guide for structure and retrieval. Sentence clarity remains owned by this adaptation.

The standalone rewrite workflow and Python linter are not bundled. The official
ASD dictionary is not reproduced. No certified STE compliance is claimed.
The original MIT license is preserved in [LICENSE](LICENSE).

On 2026-09-13, the shared guide was shortened to the clarity and evidence rules
needed on ordinary tasks. Detailed work-result structure moved to `reporting.md`,
loaded at delivery time. Fixed sentence limits and mandatory section templates
were removed; meaning, uncertainty, and verification requirements remain.

A subsequent simplification on 2026-09-13 consolidated clarity and conditional
work-evidence requirements in `output.md`. `reporting` remains a compatibility
topic; callers reuse the shared guide rather than loading a second report template.
