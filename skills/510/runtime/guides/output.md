# Write clear user-facing output

Apply this guidance to 510's user-facing replies and authored prose, including
explanations, reports, specifications, PR descriptions, and handoff documents.
Use it for response structure and as an output editing pass. It does not constrain
internal reasoning.

When the document will guide another agent, also read
[writing for agents](writing-for-agents.md) for structure, completion conditions,
and references that state when to load their targets.

Use the STE-inspired descriptive style for explanations and documents. Use its
stricter sentence structure for instructions and procedures. Preserve the user's
requested language, format, and necessary technical terms.

## Preserve the meaning

Keep every supported fact, condition, exception, quantity, and scope limit.
Preserve confidence and requirement strength. For example, keep “may have failed”
when failure is uncertain. Do not change “must” to “should” or infer a cause to
make a sentence easier to read. Keep actual results distinct from proposed work.

Preserve code, commands, identifiers, paths, links, quotations, and raw diagnostics
when their exact content matters. Do not rewrite JSON fields or other structured
tool output. Apply the writing guidance to the explanation around that material.

## Make each sentence clear

- Use active voice and name the actor. Passive voice is acceptable when the actor
  is unknown or does not matter.
- Put one instruction in each sentence. Keep the subject, verb, and necessary
  articles. Do not compress the text into fragments.
- Use at most 20 words for an instruction and 25 words for a description when
  these limits preserve meaning. Split longer sentences before removing detail.
- Use one consistent term for each concept. Prefer plain verbs to phrases such
  as “perform an analysis.” Explain unfamiliar domain terms when needed.
- Prefer simple tenses. Keep a compound tense when it conveys timing, current
  state, or uncertainty that a simple tense would lose.
- Avoid semicolons in authored prose. Split long noun clusters into clear phrases.
  Prefer a single clear verb to an ambiguous phrasal verb.
- Keep one topic in each paragraph, with at most six sentences. Use a list when
  steps or conditions are easier to follow separately.
- Remove filler, unsupported praise, and repeated conclusions. Retain necessary
  qualifications and evidence.

## Return the result

Return the requested answer or artifact. Do not announce the writing mode or add
a style audit. Keep required findings, verification results, citations, and limits.
Provide a before/after rule table only when the user requests a writing comparison.

### Make the response scannable

Lead with the answer or outcome in one or two sentences. State partial completion
or uncertainty there when it affects the conclusion. A confirmed code defect does
not establish that the user's reported symptom is resolved.

For substantial replies, separate topics with short headings or bold section
labels. Use bullets for parallel findings, changes, or checks. Use numbered lists
for ordered steps and tables when shared columns make comparisons easier.
Keep explanations in connected prose within those sections. Bold key labels or
statuses selectively, so the reader can find the result without reading every line.

Choose sections for the task. An explanation might use **How it works** and
**Relevant files**. An exploration might use **Options**, **Tradeoffs**, and
**Open questions**. A review uses prioritized findings and coverage. Preserve
workflow-specific content and the user's requested format. Simple answers and
brief progress updates can remain a short paragraph.

Default to a compact result. Give each change, check, or next step one concise
entry. State each detail once and link supporting evidence. Retain the cause,
scope, and unresolved limitations needed to understand the outcome.

### Structure work results

When reporting completed or partial work, use the following order after the
opening outcome. Include each applicable section with a visible label. File edits
require **Changed files**, even for a small change. Omit other empty sections.

- **Changed files:** list each file added, modified, renamed, or deleted by this
  task, with a concise explanation of its change and purpose. Include relevant
  tests, documentation, configuration, and generated outputs. Group related files
  only when each path remains identifiable. Base the list on the final diff and
  new files, accounting for any commits made during the task. Exclude unrelated
  changes. Link local files with short path labels and absolute targets supported
  by the host. Use a diff link or the old path for deleted files.
- **Verification:** use explicit results such as **Passed**, **Failed**, **Blocked**,
  or **Not run**. Group related checks with the same result when their names remain
  clear. Include useful counts or measurements and say what focused tests establish.
  Separate tests, builds, manual or device checks, and 510 static analysis. Successful individual
  checks do not imply the complete analysis passed. Report remaining findings and
  coverage gaps with their scope and a link to the detailed report.
- **Remaining work:** use lettered steps, **A.**, **B.**, **C.**, continuing as needed.
  Give each step a short bold action label and one concrete check, action, or
  decision. For example: **A. Verify device scrolling.** Check scrolling beyond
  ten and twenty cards. Explain blockers and who can act when known. Keep letters
  stable when discussing the same steps in follow-up replies. Surface any
  limitation that prevents claiming success in the opening outcome as well.
- **References and state:** link saved artifacts such as diagnoses, specs, and
  reports when they were not already linked above. State commit, PR, or publication
  status when relevant, using verified identifiers and links.

These sections summarize evidence already gathered. Do not run extra checks,
create artifacts, or infer results merely to fill the format. Keep the result
self-contained: the reader should understand the change and remaining work
without opening a report or expanding progress messages. Use links for detail,
not as substitutes for the changed-file list or unresolved findings.

Before sending, check that the outcome, changed files, verification, and remaining
work are easy to locate independently. Do not compress them into a prose-only
recap or hide an unresolved check behind a total passing-test count.

If simplifying a phrase would remove required precision, keep it. Add a brief
“Kept as-is:” note only when the retained phrase needs an explanation.
This is clarity guidance, not certified ASD-STE100 compliance. It does not include
the standard's official dictionary.

Adapted from [danyuchn/asd-ste100-skill](https://github.com/danyuchn/asd-ste100-skill).
See the bundled [source record](upstream/asd-ste100-skill/UPSTREAM.md) and
[MIT license](upstream/asd-ste100-skill/LICENSE).
