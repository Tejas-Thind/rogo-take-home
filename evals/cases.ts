/**
 * Eval cases for the research agent.
 *
 * Each case has a `target`: a human-readable spec of what a great answer
 * contains (facts, caveats, structure) — not a single "gold" string to diff
 * against, since natural-language answers don't have one correct phrasing.
 * `checks` automate the parts of that target that are actually checkable
 * (does it mention X, does it avoid stating Y); the target itself is there
 * so a person can read the case and judge the parts a regex can't.
 *
 * `turns` is normally one message. A case with more than one simulates a
 * follow-up question, sent as independent stateless requests — same as the
 * real UI, which never threads prior turns back to the server.
 *
 * Not wired into `npm test`: these call the real Anthropic API through the
 * running server, so they cost real tokens and take real time. Run them by
 * hand with `npm run eval` when you want to check whether a behavior change
 * actually helped.
 */

export interface EvalCheck {
  description: string;
  test: (answers: string[]) => boolean;
}

export interface EvalCase {
  name: string;
  /** What a great answer looks like. Not auto-graded — for a human to read. */
  target: string;
  turns: string[];
  checks: EvalCheck[];
  /** Set on a case that's expected to fail today — documents a known gap. */
  note?: string;
}

function last(answers: string[]): string {
  return answers[answers.length - 1] ?? "";
}

function contains(needles: string[]) {
  return (answer: string) => {
    const lower = answer.toLowerCase();
    return needles.some((needle) => lower.includes(needle.toLowerCase()));
  };
}

function lastContains(needles: string[]): (answers: string[]) => boolean {
  return (answers) => contains(needles)(last(answers));
}

export const evalCases: EvalCase[] = [
  // --- From the README's own suggested example questions ---
  {
    name: "acme-ambiguity",
    target:
      "Flags that 'Acme' could mean Acme Corp or Acme Robotics before or while answering, rather than silently picking one. Gives real growth figures (CAGR and/or YoY) for the comparison. Ideally mentions Acme Robotics' much higher growth (~47-48%) so the reader isn't misled if that's the one they meant. No fabricated numbers.",
    turns: ["Compare Acme and Globex and tell me which one appears to be growing faster."],
    checks: [
      {
        description: "Discloses the Acme Corp / Acme Robotics ambiguity instead of silently picking one",
        test: lastContains([
          "acme robotics",
          "which acme",
          "assuming acme corp",
          "assumed acme corp",
          "let me know if you meant",
        ]),
      },
    ],
  },
  {
    name: "ticker-resolution",
    target:
      "Correctly identifies GLBX as Globex Inc and ITCH as Initech, spelling out at least one full name so it's clear the tickers were understood, not just echoed. Compares margins, growth, and business model. Flags Initech's delayed 10-K / revenue-recognition review as a real caveat. Gives a reasoned verdict rather than a flat unsupported winner, since the real tradeoffs are genuinely mixed.",
    turns: ["Is GLBX a better business than ITCH?"],
    checks: [
      {
        description: "Spells out at least one full company name, not just the ticker",
        test: lastContains(["globex", "initech"]),
      },
      {
        description: "Flags Initech's delayed 10-K / revenue-recognition review",
        test: lastContains(["delayed", "revenue recognition", "preliminary", "unaudited"]),
      },
    ],
  },
  {
    name: "initech-unfiled-fy2025",
    target:
      "Reports the real subscription-transition trend (mix rising ~62%→68%, NRR 112%, license revenue declining as expected). Explicitly labels FY2025 figures as preliminary/unaudited and names the delayed 10-K / revenue-recognition review as the reason. Does not present the 8-K guidance range as confirmed.",
    turns: ["How is Initech's subscription transition going?"],
    checks: [
      {
        description: "Flags FY2025 figures as preliminary/unfiled rather than stating them as final",
        test: lastContains(["preliminary", "unaudited", "delayed", "not yet filed", "not been filed"]),
      },
    ],
  },
  {
    name: "umbrella-growth-quality",
    target:
      "Names acquisition-dependency as a top risk, with the real split (9.6% total growth, ~6.5pp acquisition-driven, ~3.1% organic/same-clinic). Names government reimbursement exposure (~41% of Clinic Operations revenue). Mentions margin pressure from integration costs / wage inflation. Ideally flags that it only has partial document coverage, not the full risk-factors section.",
    turns: ["What are the biggest risks Umbrella Health flags in its filings?"],
    checks: [
      {
        description: "Separates organic growth from acquisition-driven growth, citing the real split",
        test: (answers) => contains(["organic", "acquisition"])(last(answers)) && /3\.1|6\.5/.test(last(answers)),
      },
    ],
  },
  {
    name: "fastest-grower",
    target:
      "Correctly names Acme Robotics specifically (not just 'Acme') as the fastest grower, with the real ~47-48% figure, and gives rough comparison numbers for the rest of the universe to substantiate the ranking.",
    turns: ["Which company in the universe is growing fastest?"],
    checks: [
      {
        description: "Names Acme Robotics specifically, not just 'Acme'",
        test: lastContains(["acme robotics"]),
      },
    ],
  },
  {
    name: "out-of-coverage",
    target:
      "Clearly declines, states Tesla isn't in the coverage universe. Does not state any specific revenue figure for Tesla, verified or caveated — the point is not blending sourced and unsourced data in one answer.",
    turns: ["What was Tesla's revenue last year?"],
    checks: [
      {
        description: "Declines rather than inventing a number",
        test: lastContains([
          "don't cover",
          "not part of",
          "coverage",
          "doesn't cover",
          "no data on",
          "don't have data on",
          "outside the companies",
          "outside my",
          "isn't in my",
          "not something i cover",
        ]),
      },
      {
        description: "Does not state a specific revenue figure for Tesla",
        test: (answers) => !/tesla[^.]{0,40}\$[\d,.]+\s*(billion|million|b\b|m\b)/i.test(last(answers)),
      },
    ],
  },

  // --- Added by Tejas ---
  {
    name: "rank-by-operating-margin",
    target:
      "Correct order, highest to lowest, using each company's latest FILED year (FY2025 for four companies, FY2024 for Initech since FY2025 isn't filed): Initech (~17.5%), Acme Corp (~12.2%), Globex Inc (~9.9%), Umbrella Health (~8.4%), Acme Robotics (~5.1%). A strong answer explicitly notes Initech's figure is from FY2024, not FY2025, given the unfiled year — this case also re-tests the unfiled-data handling from a different angle.",
    turns: ["Rank all five companies by operating margin."],
    checks: [
      {
        description: "Mentions all five companies",
        test: (answers) => {
          const a = last(answers).toLowerCase();
          return ["acme corp", "acme robotics", "globex", "initech", "umbrella"].every((name) => a.includes(name));
        },
      },
      {
        description: "Puts Initech at the top and Acme Robotics at the bottom (the correct extremes of the ranking)",
        test: (answers) => {
          const a = last(answers).toLowerCase();
          const initechIdx = a.indexOf("initech");
          const roboticsIdx = a.indexOf("acme robotics");
          return initechIdx !== -1 && roboticsIdx !== -1 && initechIdx < roboticsIdx;
        },
      },
    ],
  },
  {
    name: "follow-up-context",
    target:
      "The server now threads prior turns into the conversation, so the second question's 'that' should correctly resolve to Umbrella Health's revenue growth from the first turn, and the answer should give the real organic-growth figure (3.1%) rather than asking for clarification.",
    turns: ["What's Umbrella Health's revenue growth?", "How much of that was organic?"],
    checks: [
      {
        description: "Resolves 'that' to Umbrella Health's growth without asking for clarification",
        test: (answers) => !contains(["which company", "clarify", "what does 'that'", "what do you mean"])(last(answers)),
      },
      {
        description: "States the real organic growth figure (3.1%)",
        test: (answers) => /3\.1/.test(last(answers)),
      },
    ],
  },
  {
    name: "terse-query",
    target:
      "Interprets 'umbrella growth ok?' as asking about Umbrella Health's growth, retrieves the real figures (9.6% total, 3.1% organic), and answers helpfully despite the informal phrasing — doesn't refuse or over-ask for clarification when the intent is actually clear.",
    turns: ["umbrella growth ok?"],
    checks: [
      {
        description: "Answers with real Umbrella Health growth figures rather than refusing or over-clarifying",
        test: (answers) => /9\.6|3\.1/.test(last(answers)),
      },
    ],
  },
  {
    name: "three-way-comparison",
    target:
      "Correctly pulls financials for Acme Robotics, Initech, and Umbrella Health, presents a clear comparison covering both growth and margins, and notes Initech's unfiled-FY2025 caveat since it's one of the three.",
    turns: ["Compare growth and margins across Acme Robotics, Initech, and Umbrella Health."],
    checks: [
      {
        description: "Covers all three companies",
        test: (answers) =>
          contains(["acme robotics"])(last(answers)) &&
          contains(["initech"])(last(answers)) &&
          contains(["umbrella"])(last(answers)),
      },
      {
        description: "Flags Initech's unfiled FY2025 in this context too",
        test: lastContains(["preliminary", "unaudited", "delayed", "not yet filed", "not been filed"]),
      },
    ],
  },
  {
    name: "fabrication-pressure-test",
    target:
      "Correctly states that AI investment plans aren't mentioned in the documents it can search, rather than inventing a plausible-sounding quote. Nothing in the actual earnings call excerpts discusses AI investment — this is the single most important trust check in the set: does it fabricate when there's nothing to find?",
    turns: ["What did Acme Corp's CEO say about AI investment plans on the earnings call?"],
    checks: [
      {
        description: "Does not fabricate a quote or claim about AI investment that isn't in the source documents",
        test: lastContains([
          "didn't find",
          "did not find",
          "doesn't mention",
          "does not mention",
          "no mention",
          "couldn't find",
          "could not find",
          "not addressed",
          "not discussed",
          "don't see",
          "do not see",
          "didn't say anything",
          "did not say anything",
          "nothing about",
          "no mention of",
          "found nothing",
          "isn't in the documents",
          "isn't in the",
          "not in the documents",
        ]),
      },
    ],
  },
  {
    name: "plain-fact-retrieval",
    target:
      "States Initech's net revenue retention as 112% (from the FY2024 Q4 earnings call), ideally noting it's a FY2024 figure. Should be fast — a single, direct fact lookup, useful as a control case against the more open-ended questions.",
    turns: ["What's Initech's net revenue retention rate?"],
    checks: [
      {
        description: "States the correct NRR figure (112%)",
        test: lastContains(["112%", "112 percent"]),
      },
    ],
  },
  {
    name: "ambiguity-reprobe",
    target:
      "Same disclosure requirement as acme-ambiguity, but starker: 'Acme' is used with zero other company as an anchor. Should flag the Acme Corp / Acme Robotics split rather than picking one silently.",
    turns: ["What's Acme's biggest risk factor?"],
    checks: [
      {
        description: "Discloses the Acme Corp / Acme Robotics ambiguity instead of silently picking one",
        test: lastContains([
          "acme robotics",
          "which acme",
          "assuming acme corp",
          "assumed acme corp",
          "let me know if you meant",
          "two acme",
          "two companies named acme",
        ]),
      },
    ],
  },
];
