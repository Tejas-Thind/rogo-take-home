# Notes

Before changing anything, I ran a set of test questions against the agent to see what was broken. After each fix, I ran the same questions again to confirm it worked. The questions and results are in `evals/`.

## Agent behavior

- The data has two unrelated companies that both match "Acme" (Acme Corp, Acme Robotics). The agent would silently guess one. I tested it four separate times and got the wrong company chosen once. Fixed the lookup itself (`tools.ts`) to detect the collision and return an error naming both, so the model asks instead of guessing. Tickers (GLBX, ITCH, etc.) resolve the same way now.
- The agent sometimes stated a figure for a company outside its five company coverage (once gave an unverified Tesla revenue number). The system prompt now says it should never give a number for a company it has no data on, even with a disclaimer attached.
- Initech's unfiled FY2025 data got flagged as a warning when Initech was asked about directly, but dropped when Initech was one of several companies in a comparison. Fixed by making the instruction general instead of scoped to single company questions.
- There was no conversation memory. Every question was a fresh, stateless request, so a follow up like "how much of that was organic?" had nothing to attach "that" to. I built it by writing tests first, for the function that turns prior history into the message the model sees, before that function existed. Only prior turns' final answer text carries forward, not the raw data from tool calls, so context doesn't grow unbounded over a long conversation.

## Performance

- Every answer paid for two full model calls. The first call did the research, then a second "editor" call reworded the draft for zero new information. I removed it and folded its intent into the main system prompt. It also had the power to edit away a warning like the Initech one.
- Tool calls inside one turn ran one after another even though they're independent. Now they run at the same time. A question about 5 companies used to spend about 4 seconds just waiting on those lookups. Now it takes under 1 second.
- I added prompt caching for the system prompt and tool definitions, since neither changes within or between questions. I checked this against the API response data instead of assuming it worked. The first call created a cache of 1,401 tokens, and the second call read from it instead of reprocessing.
- I measured the combined effect with the eval harness. The same 13 test questions took 311.6 seconds total before these changes and 139.5 seconds after, about 55% faster.

## Product / UX

- Markdown (tables, bold, headers) was rendering as literal text because the UI never parsed it. I fixed it, and caught a second bug while doing it. Tables specifically needed the GFM markdown extension, which I missed on the first pass.
- I replaced the static "Thinking…" with a status line showing what the agent is doing ("Pulling financials for Globex Inc…"), using event data the server already generated but wasn't sending to the UI.
- Empty messages used to crash the server and show a raw internal API error to the user. They're now rejected cleanly before reaching the model.
- The input refocuses automatically after each answer, and I added a "New conversation" button to clear the thread.

## Engineering quality

- I added 22 unit tests for the deterministic logic, covering company resolution, search limits, and the code that builds message history. One of them caught a bug before it shipped. Acme Corp's ticker is "ACME," so it matched before the ambiguity check ran.
- I wrote a set of eval questions to check how the agent behaves. Running them before any changes showed what was broken. Running them again after each fix showed whether it was fixed.

## Example

> **What is the growth for Umbrella Health?**
> Gives the ~9% revenue CAGR, full year by year table, and margin trend.
>
> **Is this organic?**
> "No, most of the reported growth is not organic, it's acquisition driven." Gives the 6.5pp acquisition / 3.1pp organic split, cites the 10-K directly.
>
> **What about Acme?**
> "There are two 'Acme' companies in coverage, Acme Corp (ACME, Industrial Automation) and Acme Robotics (ACMR, Robotics), and they have no corporate relationship to each other. Which one did you mean?"
>
> **Robotics**
> Gives Acme Robotics' ~48% CAGR, full breakdown, with no need to ask again who "Robotics" refers to.
