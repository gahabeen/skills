# Evaluate 510 behavior and context

Runtime tests establish tool behavior; agent evaluations establish whether the
instructions guide a model usefully. The eight cases in `evals/510/cases.mjs`
cover help, explanation, a feature, unresolved requirements, a boundary parser,
missing analyzer evidence, scoped review, and preservation of unrelated staging.

Prepare separate runs from the previous and candidate skill directories:

```sh
bun run eval:510 list
bun run eval:510 prepare --case explain --variant baseline --skill /path/to/previous/510 --output /tmp/510-baseline-1
bun run eval:510 prepare --case explain --variant candidate --skill skills/510 --output /tmp/510-candidate-1
```

Each run gets an isolated project, a skill snapshot, `request.json`, and a rubric.
Existing directories are rejected. The commit case initializes only its disposable
fixture repository, with separate selected and unrelated staged work. No external
service, package installation, model, or network request is selected automatically.
For comparable substantive tasks, `--variant none` without `--skill` supplies a
no-skill control prompt. Bare skill invocation has no useful no-skill counterpart.

Run an independent agent against the request. Give it the task, skill, and raw
fixture artifacts without prior conclusions or a proposed solution. Inspect its
answer, changes, commands, and required checks against the rubric. Record actual
reads and repeated reads. Preserve fixture artifacts so claims can be verified.

An optional adapter can automate this with `run` instead of `prepare`:

```sh
bun run eval:510 run --case explain --variant candidate --skill skills/510 --output /tmp/510-run-1 --runner /path/to/adapter --runner-arg argument
```

The adapter receives request JSON on stdin in the fixture directory and emits one
record on stdout. It chooses its own explicitly configured agent interface.
Diagnostics use stderr. Timeouts kill the process group on POSIX; partial fixtures
remain available. Windows child-process-tree cleanup is not claimed.
The adapter must respect the requested scope and may not claim unavailable checks.

Record format:

```json
{
  "caseId": "explain",
  "variant": "candidate",
  "model": null,
  "qualityChecks": [{ "name": "Correct subtotal", "passed": true, "evidence": "Source and answer establish the same arithmetic." }],
  "reads": ["/absolute/path/to/read/file"],
  "toolCalls": ["Read source"],
  "durationMs": 1200,
  "inputTokens": null,
  "outputTokens": null,
  "answer": "The actual response"
}
```

Supply every check from that case's rubric with evidence. Missing, duplicate, or
unevidenced assessments are unverified and prevent the evaluation passing.
The example above is intentionally incomplete. Missing telemetry is null, not
zero; the runner measures elapsed time but cannot infer model token counts.
Record exact model and configuration when the harness exposes them.

Summarize manually recorded or adapter-produced runs:

```sh
bun run eval:510 summarize /tmp/510-baseline-1/result.json /tmp/510-candidate-1/result.json --output /tmp/510-comparison.json
```

Summaries include rubric outcomes, source hashes, repeated file-read counts,
full-file word volume, tool calls, duration, and available tokens. These word counts
are not token estimates and can overstate partial file reads. Compare complete
read evidence consistently. Keep snapshots unchanged while producing summaries.

Compare repeated runs with the same model, fixtures, permissions, and task. Examine
quality first, then context and time. The summary exposes sample sizes and whether
model identity is known. A single successful task is a smoke check, not proof of
better reasoning. Broaden the corpus based on actual failures and representative
project work; do not tune instructions solely to pass these fixture prompts.

Reference: [Agent Skills evaluation guidance](https://agentskills.io/skill-creation/evaluating-skills).
