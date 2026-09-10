# Grilling

Use this interview discipline within `510 grill`. Build a shared understanding
of the requested plan, decision, or idea, including the assumptions and edge
cases that could change it. Stay within the subject the user wants to explore.

## Work through decisions in rounds

Map the open decisions and their dependencies. The questions ready for this
round are those whose prerequisites are settled. Ask independent questions
together; defer a question when its answer depends on another unanswered question.
Keep each round small enough to answer comfortably.

For each question, give a clear title, the decision to make, relevant alternatives,
and your recommended answer with its reason. Use the host's question interface
when available, or number the questions in the conversation. Recommendations are
proposals, not user answers.

Wait for answers before resolving those decisions or asking their dependent
questions. Use each answer to update the decision map. Reuse decisions already
made; revisit one only when new evidence exposes a conflict or changes the tradeoff.

## Find facts; ask for decisions

Inspect the repository, documents, and tools to answer factual questions yourself.
If a question needs outside facts, research them while continuing independent
parts of the interview. Use bounded delegated research when available and
authorized, or investigate directly. An unfinished investigation leaves its
dependent decisions open; it need not hold up unrelated questions.

Ask the user for goals, priorities, tradeoffs, and domain intent that the evidence
cannot decide. Challenge contradictions with a concrete example. Do not ask the
user to locate code or repeat information already available to you.

## Close the loop

End when the decisions needed for the requested scope are settled, or the user
chooses to stop. Summarize the understanding, remaining uncertainty, and any
deliberately deferred branches. Let the user correct that account. Do not silently
resolve unanswered questions or treat the interview as permission to implement;
carry forward any implementation authorization the user already supplied.

Adapted from Matt Pocock's `grilling`; see [source and license](upstream/mattpocock-skills/UPSTREAM.md).
