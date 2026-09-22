# Notes

Before changing anything, I ran a set of test questions against the agent to see what was actually broken. After each fix, I ran the same questions again to confirm it worked. The questions and results are in `evals/`.

## Agent behavior

- The data has two unrelated companies that both match "Acme" (Acme Corp, Acme Robotics). The agent would silently guess one. I tested it four separate times and got the wrong company chosen once. Fixed the lookup itself (`tools.ts`) to detect the collision and return an error naming both, so the model asks instead of guessing. Tickers (GLBX, ITCH, etc.) resolve the same way now.
- The agent sometimes stated a real-world figure for a company outside its five-company coverage (once gave an unverified Tesla revenue number). System prompt now explicitly forbids stating any figure, caveated or not, for a company it has no data on.
- Initech's unfiled FY2025 data got flagged as a caveat when Initech was asked about directly, but dropped when Initech was one of several companies in a comparison. Fixed by making the instruction general instead of scoped to single-company questions.
- No conversation memory: every question was a fresh, stateless request, so a follow-up like "how much of that was organic?" had nothing to attach "that" to. Built it test-first: wrote unit tests for the history-building logic before it existed, then implemented it. Only prior turns' final answer text carries forward, not raw tool-call data, so context doesn't grow unbounded over a long conversation.

## Performance

- Every answer paid for two full model calls: the actual research, then a second "editor" call that just reworded the draft for zero new information. Removed it, folded its intent into the main system prompt. It also carried a real risk: it had the power to quietly edit away a caveat like the Initech one.
- Tool calls inside one turn ran one after another even though they're independent. Now run in parallel. A 5-company question that took ~4 seconds of pure tool-call waiting now takes under 1 second.
- Added prompt caching for the system prompt and tool definitions, since neither changes within or between questions. Verified against real API response data, not assumed: first call created a 1,401-token cache, second call read from it instead of reprocessing.
- Combined effect, measured with the eval harness: the same 13 test questions took 311.6 seconds total before these changes, 139.5 seconds after, about 55% faster.

## Product / UX

- Markdown (tables, bold, headers) was rendering as literal text because the UI never parsed it. Fixed, and caught a second bug doing it: tables specifically needed the GFM markdown extension, which I missed on the first pass. I caught it by actually looking at the app in a browser, not by assuming the library worked.
- Replaced the static "Thinking…" with the agent's real tool-call progress ("Pulling financials for Globex Inc…"), using event data the server already generated but wasn't sending to the UI.
- Empty messages crashed the server and showed a raw internal API error to the user. Now rejected cleanly before it reaches the model.
- Input refocuses automatically after each answer, and added a "New conversation" button to clear the thread. Small change, but it matters more now that the app has memory.

## Engineering quality

- Zero tests existed despite the test runner being configured. Added 22 unit tests for the deterministic logic (company resolution, search limits, message-history building). One of them caught a real bug before it shipped: Acme Corp's ticker is literally the string "ACME," which was silently bypassing the ambiguity check entirely.
- Built a small eval harness for the part unit tests can't reach: actual agent behavior against the real model. 13 questions, a rubric per question, before/after comparison. Final result: 18/18 checks passing, up from 13/16 on the unmodified code.

## Example, from this session (asked live, not scripted)

> **What is the growth for Umbrella Health?**
> Gives the ~9% revenue CAGR, full year-by-year table, and margin trend.
>
> **Is this organic?**
> "No, most of the reported growth is not organic, it's acquisition-driven." Gives the 6.5pp acquisition / 3.1pp organic split, cites the 10-K directly.
>
> **What about Acme?**
> "There are two 'Acme' companies in coverage, Acme Corp (ACME, Industrial Automation) and Acme Robotics (ACMR, Robotics), and they have no corporate relationship to each other. Which one did you mean?"
>
> **Robotics**
> Gives Acme Robotics' ~48% CAGR, full breakdown, no re-asking who "Robotics" refers to.