# Write clear user-facing output

Apply this guidance to 510's user-facing replies and authored prose, including
explanations, reports, specifications, PR descriptions, and handoff documents.
Use it as an output editing pass. It does not constrain internal reasoning.

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

If simplifying a phrase would remove required precision, keep it. Add a brief
“Kept as-is:” note only when the retained phrase needs an explanation.
This is clarity guidance, not certified ASD-STE100 compliance. It does not include
the standard's official dictionary.

Adapted from [danyuchn/asd-ste100-skill](https://github.com/danyuchn/asd-ste100-skill).
See the bundled [source record](upstream/asd-ste100-skill/UPSTREAM.md) and
[MIT license](upstream/asd-ste100-skill/LICENSE).
