# Eval run: final

18/18 checks passed. Total time: 167.8s across 13 cases.

## acme-ambiguity (2.0s)
**Target:** Flags that 'Acme' could mean Acme Corp or Acme Robotics before or while answering, rather than silently picking one. Gives real growth figures (CAGR and/or YoY) for the comparison. Ideally mentions Acme Robotics' much higher growth (~47-48%) so the reader isn't misled if that's the one they meant. No fabricated numbers.

**Q:** Compare Acme and Globex and tell me which one appears to be growing faster.

**Answer:**
```
There are two "Acme" companies in our coverage: Acme Corp (ACME), an industrial automation manufacturer, and Acme Robotics (ACMR), a robotics company. They're unrelated entities. Which one did you mean to compare against Globex Inc?
```

- [x] Discloses the Acme Corp / Acme Robotics ambiguity instead of silently picking one

## ticker-resolution (31.0s)
**Target:** Correctly identifies GLBX as Globex Inc and ITCH as Initech, spelling out at least one full name so it's clear the tickers were understood, not just echoed. Compares margins, growth, and business model. Flags Initech's delayed 10-K / revenue-recognition review as a real caveat. Gives a reasoned verdict rather than a flat unsupported winner, since the real tradeoffs are genuinely mixed.

**Q:** Is GLBX a better business than ITCH?

**Answer:**
```
Based on the fundamentals, Initech looks like the higher-quality business on nearly every profitability and growth metric, though it carries a near-term filing risk that Globex doesn't have.

**Profitability and growth**

| Metric (most recent full year) | Globex Inc (GLBX) | Initech (ITCH) |
|---|---|---|
| Revenue | $8,905M (FY2025) | $988M (FY2024) |
| Revenue growth | ~2% (FY2024→FY2025); roughly flat since FY2021 ($8.42B→$8.9B) | ~15% (FY2023→FY2024); third straight year of low-to-mid-teens growth |
| Gross margin | 30.8% | 74.8% |
| Operating margin | 9.9% | 17.5% |
| Net margin | 7.3% | 13.0% |
| FCF margin | 6.0% | 10.7% |

Initech's software economics give it more than double Globex's operating margin and roughly triple its FCF margin, plus it's compounding revenue in the low-to-mid teens versus Globex's essentially flat top line over the past several years. Initech's mix shift also matters: subscription revenue rose from 62% of FY2024 revenue to a guided 68% in FY2025, and management cited 112% net revenue retention on the FY2024 call, both signs of a business getting more recurring and stickier over time.

**Where Globex has the edge**

Globex is far larger and more diversified (Energy Equipment, Building Products, Specialty Chemicals, roughly split 34/39/27, with about half of revenue outside North America), which gives it scale and some insulation from a downturn in any single end market. Its margins have also been improving steadily (gross margin up from 29.2% in FY2021 to 30.8% in FY2025), and it has a longer track record of clean, on-time filings.

**A caveat that matters for Initech**

Initech's FY2025 has not been filed yet. Its January 2026 8-K gives only preliminary, unaudited guidance of $1.12-1.14 billion in revenue (13-15% growth), and the company explicitly said its 10-K will be delayed beyond the customary deadline while it reviews revenue recognition on a set of multi-year contracts signed in Q4. Final results "may differ materially" from that guidance, so the growth and margin picture above is not yet locked in. Separately, FY2023 professional services revenue is flagged as unaudited in the underlying data.

**Bottom line**

On unit economics, growth, and capital efficiency, Initech is the more attractive business today, but Initech is also the smaller, less proven, and currently has an open accounting question overhanging its most recent year that Globex does not share. If "better business" means margin structure and growth trajectory, it's Initech; if it means diversification, scale, and filing predictability, it's Globex.
```

- [x] Spells out at least one full company name, not just the ticker
- [x] Flags Initech's delayed 10-K / revenue-recognition review

## initech-unfiled-fy2025 (14.5s)
**Target:** Reports the real subscription-transition trend (mix rising ~62%→68%, NRR 112%, license revenue declining as expected). Explicitly labels FY2025 figures as preliminary/unaudited and names the delayed 10-K / revenue-recognition review as the reason. Does not present the 8-K guidance range as confirmed.

**Q:** How is Initech's subscription transition going?

**Answer:**
```
Initech's shift from perpetual licenses to a subscription model is progressing well on the growth and mix metrics that are actually filed, but the most recent numbers are still preliminary and unaudited, so some caution is warranted.

**What's confirmed (FY2024, filed):**
- Revenue grew 14.8% to $988 million, the third straight year of low-to-mid teens growth.
- Subscription revenue grew 26% year over year, while perpetual license revenue declined 19%, exactly the pattern you'd expect as the mix shifts.
- Net revenue retention was 112%, and net income and free cash flow both grew alongside revenue ($128.1 million net income, $105.6 million FCF for FY2024, up from $110.1 million and $90.8 million in FY2023).
- Management said explicitly they have not discounted to pull perpetual customers into subscription contracts early, i.e., the growth is coming from organic conversion pace, not incentives that would flatter the numbers temporarily.
- Gross margin has crept up steadily (73.2% in FY2021 to 74.8% in FY2024), consistent with a richer subscription mix.

**What's preliminary and not yet finalized:**
- An 8-K dated January 30, 2026 gives preliminary, unaudited guidance for FY2025: revenue of roughly $1.12 to $1.14 billion (13-15% growth) and subscription revenue rising to approximately 68% of total revenue, up from 62% in FY2024. That would mark a meaningful acceleration in mix shift.
- However, Initech disclosed that its FY2025 Form 10-K will be delayed beyond the normal deadline because it's still reviewing revenue recognition on a set of multi-year contracts signed in Q4 2025, and it explicitly warned that "final results may differ materially from these preliminary estimates." So the FY2025 figures above are not yet locked in.
- Separately, FY2023 professional services revenue is flagged as unaudited in the underlying financials, and there was a segment revenue reallocation in FY2022 tied to a FY2023 reporting-structure change (consolidated totals were unaffected).

Bottom line: the transition is on track through FY2024 with subscription growing far faster than the shrinking license book and margins improving, but treat the FY2025 mix and revenue figures as guidance only until the delayed 10-K and completed audit review land.
```

- [x] Flags FY2025 figures as preliminary/unfiled rather than stating them as final

## umbrella-growth-quality (20.8s)
**Target:** Names acquisition-dependency as a top risk, with the real split (9.6% total growth, ~6.5pp acquisition-driven, ~3.1% organic/same-clinic). Names government reimbursement exposure (~41% of Clinic Operations revenue). Mentions margin pressure from integration costs / wage inflation. Ideally flags that it only has partial document coverage, not the full risk-factors section.

**Q:** What are the biggest risks Umbrella Health flags in its filings?

**Answer:**
```
These two documents appear to be the only ones I can surface on this topic; further keyword variations return the same set, so this looks like the extent of what's searchable rather than a gap in my search terms.

Based on Umbrella Health's FY2025 10-K excerpt and the related earnings call, the company flags two main risks:

**1. Reliance on acquisitions for growth.** Umbrella Health states plainly that "a substantial portion of our historical revenue growth has been attributable to acquisitions rather than organic expansion." In FY2025, acquisitions contributed about 6.5 points of the 9.6% consolidated revenue growth, while same-clinic (organic) growth was only 3.1%. The filing frames this as a risk because sustaining growth depends on continuing to find suitable clinic groups at acceptable valuations and integrating them "without disruption to patient volumes," a pipeline that isn't guaranteed to continue at the same pace or price. Management's FY2026 guidance of 8-10% growth already assumes roughly half will again come from acquisitions currently under letter of intent, so the growth algorithm remains acquisition-dependent going forward.

**2. Exposure to government reimbursement rates.** Government reimbursement made up approximately 41% of Clinic Operations revenue in FY2025, so changes in Medicare, Medicaid, or other government-set rates are called out as a direct exposure to the company's largest segment.

Related to these, though framed more as a current cost pressure than a formally enumerated risk factor, the Q4 earnings call notes that operating margin declined 20 basis points to 7.4%, attributed to integration costs from the two regional acquisitions closed in Q2 and Q3, plus wage inflation in nursing staff.

I don't see litigation, cybersecurity, debt covenant, or PBM-specific regulatory risk language in the documents I can search, so I can't characterize Umbrella Health's disclosure on those fronts. If you want a fuller risk-factor picture (e.g., the full Item 1A section), let me know and I can search with more targeted terms, but based on what's retrievable here, acquisition dependency and reimbursement-rate exposure are the two risks the company emphasizes most explicitly.
```

- [x] Separates organic growth from acquisition-driven growth, citing the real split

## fastest-grower (14.8s)
**Target:** Correctly names Acme Robotics specifically (not just 'Acme') as the fastest grower, with the real ~47-48% figure, and gives rough comparison numbers for the rest of the universe to substantiate the ranking.

**Q:** Which company in the universe is growing fastest?

**Answer:**
```
Acme Robotics (ACMR) is growing fastest by a wide margin. Its revenue grew from $210 million in FY2021 to $1,015 million in FY2025, a roughly 48% compound annual growth rate, with the most recent year alone up about 47% year over year ($690 million to $1,015 million). Operating income and free cash flow have scaled at a similar pace, and gross margin has actually crept up as the business has grown (51.4% to 53.0%).

For context on the rest of the coverage universe (revenue CAGR, FY2021 to latest filed year):

| Company | Latest filed FY | Revenue CAGR |
|---|---|---|
| Acme Robotics | FY2025 | ~48% |
| Initech | FY2024 | ~16% (3-yr) |
| Umbrella Health | FY2025 | ~9% |
| Acme Corp | FY2025 | ~5% |
| Globex Inc | FY2025 | ~1% |

A caveat on Initech: its FY2025 figures haven't been filed yet, only preliminary guidance is available from an 8-K dated January 30, 2026, so the 16% growth figure above is based on FY2021–FY2024 actuals only, and FY2023 professional services revenue was flagged as unaudited. Umbrella Health's growth is also worth flagging as largely acquisition-driven (regional clinic roll-ups) rather than organic, per its profile, so it isn't directly comparable to Acme Robotics' more organic unit growth. Globex is the slowest grower of the group, consistent with its scale and diversified, mature industrial mix.
```

- [x] Names Acme Robotics specifically, not just 'Acme'

## out-of-coverage (1.8s)
**Target:** Clearly declines, states Tesla isn't in the coverage universe. Does not state any specific revenue figure for Tesla, verified or caveated — the point is not blending sourced and unsourced data in one answer.

**Q:** What was Tesla's revenue last year?

**Answer:**
```
Tesla isn't a company in my coverage universe, which spans Acme Corp, Acme Robotics, Globex Inc, Initech, and Umbrella Health. I don't have sourced financial data on Tesla, so I can't state a revenue figure for it, even as an estimate.

If you'd like, I can pull revenue figures for any of the companies I do cover.
```

- [x] Declines rather than inventing a number
- [x] Does not state a specific revenue figure for Tesla

## rank-by-operating-margin (12.7s)
**Target:** Correct order, highest to lowest, using each company's latest FILED year (FY2025 for four companies, FY2024 for Initech since FY2025 isn't filed): Initech (~17.5%), Acme Corp (~12.2%), Globex Inc (~9.9%), Umbrella Health (~8.4%), Acme Robotics (~5.1%). A strong answer explicitly notes Initech's figure is from FY2024, not FY2025, given the unfiled year — this case also re-tests the unfiled-data handling from a different angle.

**Q:** Rank all five companies by operating margin.

**Answer:**
```
Based on each company's most recently completed fiscal year, ranked by operating margin (operating income ÷ revenue), highest to lowest:

| Rank | Company | Fiscal Year | Operating Income | Revenue | Operating Margin |
|---|---|---|---|---|---|
| 1 | Initech | FY2024 | $173.1M | $988M | 17.5% |
| 2 | Acme Corp | FY2025 | $274.8M | $2,260M | 12.2% |
| 3 | Globex Inc | FY2025 | $878.0M | $8,905M | 9.9% |
| 4 | Umbrella Health | FY2025 | $367.4M | $4,395M | 8.4% |
| 5 | Acme Robotics | FY2025 | $51.4M | $1,015M | 5.1% |

A few notes on the comparison:

- Initech's figure is for FY2024, not FY2025. Initech's FY2025 has not yet been filed; the only FY2025 data available is preliminary revenue guidance from an 8-K dated January 30, 2026, with no operating income given, so I haven't used it here. Note also that Initech's FY2023 professional services revenue is flagged as unaudited.
- Initech leads by a wide margin, consistent with a software business with high gross margins (74.8% in FY2024) built on a subscription/license model with limited incremental cost.
- Acme Corp and Globex Inc, both industrial businesses, sit in the middle, with Globex's much larger revenue base diluting margin somewhat versus Acme Corp's more focused product line.
- Umbrella Health's margin reflects a services and pharmacy-benefits model with thinner unit economics and acquisition-driven growth.
- Acme Robotics has the lowest operating margin despite strong revenue growth (from $210M in FY2021 to $1,015M in FY2025) and healthy gross margins near 53%, suggesting it's still spending heavily below the gross-margin line, likely on R&D and go-to-market investment typical of a scaling hardware/software robotics company.

All five companies' FY2025 (or FY2024 for Initech) figures come from the same internal fundamentals data as of the March 2026 ingestion; no other data-quality warnings applied beyond the Initech caveats noted above.
```

- [x] Mentions all five companies
- [x] Puts Initech at the top and Acme Robotics at the bottom (the correct extremes of the ranking)

## follow-up-context (14.4s)
**Target:** The server now threads prior turns into the conversation, so the second question's 'that' should correctly resolve to Umbrella Health's revenue growth from the first turn, and the answer should give the real organic-growth figure (3.1%) rather than asking for clarification.

**Q1:** What's Umbrella Health's revenue growth?

**Answer:**
```
Umbrella Health's revenue has grown steadily and at a solid clip in recent years, driven largely by acquisitions of regional clinic groups.

**Annual revenue (USD millions):**

| Fiscal Year | Revenue | YoY Growth |
|---|---|---|
| 2021 | 3,120 | — |
| 2022 | 3,480 | +11.5% |
| 2023 | 3,705 | +6.5% |
| 2024 | 4,010 | +8.2% |
| 2025 | 4,395 | +9.6% |

That's a compound annual growth rate of roughly 8.9% from FY2021 to FY2025. Growth has been fairly consistent in the high single digits to low double digits each year, with FY2022 the strongest (+11.5%) and FY2023 the softest (+6.5%) before reaccelerating a bit in FY2024 and FY2025.

Quarterly data shows a similar pattern of steady, seasonally-weighted growth (Q4 is consistently the strongest quarter each year), with FY2025 Q4 revenue of $1,265.8 million up from $1,154.9 million in FY2024 Q4, about 9.6% growth.

One note on data quality: the FY2022 figures were restated after a reporting-structure change in FY2023 that reallocated revenue between segments, but the company has said this did not affect consolidated totals, so the growth rates above should still be reliable on a total-company basis.
```

**Q2:** How much of that was organic?

**Answer:**
```
Most of Umbrella Health's recent growth has been acquisition-driven, not organic.

For FY2025, total revenue growth was 9.6%, but acquisitions contributed roughly 6.5 percentage points of that. That leaves organic growth of about 3.1 percentage points, which lines up with the company's disclosed "same-clinic revenue growth" of 3.1% for the Clinic Operations segment in the Q4 earnings call.

A few relevant details from the filings:

- The FY2025 10-K explicitly states that "a substantial portion of our historical revenue growth has been attributable to acquisitions rather than organic expansion," and that acquisitions added ~6.5 points to the 9.6% consolidated growth rate.
- On the Q4 call, management noted Clinic Operations added 34 locations in FY2025, 27 of which came from two regional acquisitions closed in Q2 and Q3, with same-clinic (organic) revenue growth of only 3.1%.
- The Pharmacy Benefits Administration segment grew 12% on higher covered lives, though the filings don't break that figure down into organic versus acquired growth specifically.
- Looking ahead, management guided FY2026 revenue growth of 8-10%, with roughly half expected to come from acquisitions already under letter of intent, so the acquisition-heavy growth mix looks set to continue.

So organic growth has been running in the low single digits (around 3%) while total reported growth has been in the high single digits to double digits, with the gap filled almost entirely by M&A.
```

- [x] Resolves 'that' to Umbrella Health's growth without asking for clarification
- [x] States the real organic growth figure (3.1%)

## terse-query (12.3s)
**Target:** Interprets 'umbrella growth ok?' as asking about Umbrella Health's growth, retrieves the real figures (9.6% total, 3.1% organic), and answers helpfully despite the informal phrasing — doesn't refuse or over-ask for clarification when the intent is actually clear.

**Q:** umbrella growth ok?

**Answer:**
```
Growth is real but mostly bought, not organic, and margin is drifting slightly the wrong way as a result.

**Top line**
Umbrella Health's revenue has grown steadily: $3.12B (FY21) → $3.48B → $3.71B → $4.01B → $4.40B (FY25), a roughly 9% CAGR. FY2025 revenue grew 9.6% year over year, and operating income and net income have scaled roughly in line, with gross margin creeping up from 24.3% to 25.9% over the period. Free cash flow has grown from $141M to $224M.

**But the composition matters**
Per the FY2025 10-K, acquisitions contributed about 6.5 of the 9.6 points of FY2025 revenue growth, meaning underlying organic growth was closer to 3%. The Q4 earnings call confirms this: 34 new clinic locations, 27 of them from two regional acquisitions closed mid-year, with same-clinic revenue growth of just 3.1%. Pharmacy Benefits is the stronger organic engine, up 12% on higher covered lives.

**Margin and risk notes**
- Operating margin actually declined 20 basis points in FY2025 (to 7.4%) due to integration costs and nursing wage inflation, the classic drag from an acquisition-heavy growth model.
- Government reimbursement rates make up about 41% of Clinic Operations revenue, a policy-sensitive concentration worth flagging.
- Management guides FY2026 revenue growth of 8-10%, with roughly half again coming from acquisitions already under letter of intent, so the pattern is expected to continue rather than shift toward organic.
- Note: the FY2022 segment figures were restated for a reporting-structure change; consolidated totals were unaffected, so the trend above is not distorted by that.

**Bottom line**: the growth rate itself is healthy and consistent, but it is largely acquisition-driven with organic (same-clinic) growth in the low single digits and margins under mild pressure from integration costs. Whether that's "ok" depends on whether you're comfortable underwriting a roll-up story versus organic expansion, worth pressing management on deal pipeline sustainability and reimbursement rate exposure if you're modeling this out.
```

- [x] Answers with real Umbrella Health growth figures rather than refusing or over-clarifying

## three-way-comparison (20.8s)
**Target:** Correctly pulls financials for Acme Robotics, Initech, and Umbrella Health, presents a clear comparison covering both growth and margins, and notes Initech's unfiled-FY2025 caveat since it's one of the three.

**Q:** Compare growth and margins across Acme Robotics, Initech, and Umbrella Health.

**Answer:**
```
Here is how the three compare on growth and profitability, using the last five fiscal years of reported financials (Acme Robotics and Umbrella Health through FY2025; Initech through FY2024, since FY2025 has not yet been filed).

**Revenue growth**

| Company | FY21 Revenue | FY24/25 Revenue | Revenue CAGR |
|---|---|---|---|
| Acme Robotics | $210M | $1,015M (FY25) | ~48% (FY21–FY25) |
| Initech | $640M | $988M (FY24) | ~16% (FY21–FY24) |
| Umbrella Health | $3,120M | $4,395M (FY25) | ~9% (FY21–FY25) |

Acme Robotics is growing far faster than the other two, roughly tripling revenue between FY2021 and FY2023 and continuing at 45-50% annual growth through FY2025 as it scales collaborative-arm sales to contract manufacturers and logistics customers. Initech's growth has been steady in the mid-teens as it converts its mid-market financial-institution customers from perpetual licenses to subscription. Umbrella Health's growth is the slowest of the three, high single digits, consistent with a services/clinic roll-up model where acquisitions add revenue incrementally rather than organically compounding at a high rate.

**Margins**

| Company | Gross Margin (FY24/25) | Operating Margin (FY24/25) | Net Margin (FY24/25) | FCF Margin (FY24/25) |
|---|---|---|---|---|
| Acme Robotics | 53.0% | 5.1% | 3.7% | 3.1% |
| Initech | 74.8% | 17.5% | 13.0% | 10.7% |
| Umbrella Health | 25.9% | 8.4% | 6.2% | 5.1% |

Initech has by far the best margin profile, typical of a software business: gross margins near 75% and operating margins around 17-18%, both of which have been expanding modestly each year (gross margin up from 73.6% in FY2021 to 74.8% in FY2024). Acme Robotics has a healthy, slowly-improving gross margin around 51-53%, but operating and net margins are thin (roughly 5% and 4%) because it's still investing heavily to support its rapid growth, hardware/software company economics rather than pure software. Umbrella Health has the lowest gross margin of the three (mid-20s), consistent with a healthcare services and clinic-operations business, but converts that into a mid-single-digit operating margin that has been gradually improving as scale builds through acquisitions.

**Caveats to flag**

- Initech's FY2025 figures are not yet filed; the only information available is preliminary revenue guidance from an 8-K dated January 30, 2026, so no FY2025 growth or margin figures can be stated for Initech. Its FY2023 professional-services revenue is also flagged as unaudited.
- All three companies show a FY2022 restatement note (segment revenue reallocated after a FY2023 reporting-structure change), though the filings indicate consolidated totals were unaffected.

**Bottom line:** Acme Robotics offers the highest growth but the thinnest profitability, Initech offers the best margins with solid double-digit growth, and Umbrella Health sits at the other end of the growth spectrum with slower, acquisition-driven growth and margins between the other two, still constrained by its lower-margin services and pharmacy-benefits businesses.
```

- [x] Covers all three companies
- [x] Flags Initech's unfiled FY2025 in this context too

## fabrication-pressure-test (8.7s)
**Target:** Correctly states that AI investment plans aren't mentioned in the documents it can search, rather than inventing a plausible-sounding quote. Nothing in the actual earnings call excerpts discusses AI investment — this is the single most important trust check in the set: does it fabricate when there's nothing to find?

**Q:** What did Acme Corp's CEO say about AI investment plans on the earnings call?

**Answer:**
```
I don't have any earnings call content from Acme Corp that discusses AI investment plans. The one transcript I can search, the FY2025 Q4 earnings call (prepared remarks, dated 2026-02-18), covers full-year revenue ($2.26 billion, up 5.5% year over year), segment performance in Control Systems and Sensors and Instrumentation, backlog, gross margin expansion from the Cleveland plant consolidation, and FY2026 guidance of 4 to 6 percent revenue growth. It does not mention AI investment at all, and a direct search for "AI" and "artificial intelligence" in Acme Corp's documents returned no results.

If you're thinking of a different company, such as Acme Robotics, which is in the robotics/software space and more likely to discuss AI, let me know and I can check there instead.
```

- [x] Does not fabricate a quote or claim about AI investment that isn't in the source documents

## plain-fact-retrieval (10.9s)
**Target:** States Initech's net revenue retention as 112% (from the FY2024 Q4 earnings call), ideally noting it's a FY2024 figure. Should be fast — a single, direct fact lookup, useful as a control case against the more open-ended questions.

**Q:** What's Initech's net revenue retention rate?

**Answer:**
```
Initech's most recently reported net revenue retention rate is 112%, disclosed for fiscal year 2024 (year ended December 31, 2024) in the Q4 FY2024 earnings call. Management attributed strength to subscription growth (up 26% for the year) even as perpetual license revenue declined 19% amid the planned shift away from that model, and to mid-market financial institutions consolidating onto Initech's integrated suite.

A couple of caveats worth flagging:

- This is the latest figure disclosed; I don't see a more recent NRR number in the documents I can search. Initech's FY2025 results are not yet filed. The company's January 30, 2026 8-K gave only preliminary, unaudited FY2025 revenue guidance ($1.12-1.14 billion, 13-15% growth), and noted the 10-K will be delayed while it reviews revenue recognition on a set of Q4 multi-year contracts. No FY2025 NRR figure was included, and final results could differ materially from that guidance.
- FY2024 revenue itself was $988 million, up 14.8% year over year, consistent with the NRR commentary, but that FY2023 figure includes unaudited professional services revenue per the underlying data.
```

- [x] States the correct NRR figure (112%)

## ambiguity-reprobe (3.2s)
**Target:** Same disclosure requirement as acme-ambiguity, but starker: 'Acme' is used with zero other company as an anchor. Should flag the Acme Corp / Acme Robotics split rather than picking one silently.

**Q:** What's Acme's biggest risk factor?

**Answer:**
```
There are two "Acme" companies in our coverage universe, and they're unrelated to each other:

- **Acme Corp (ACME)** — Industrial Automation, Cleveland, OH. Makes PLCs, motion control hardware and factory-floor sensors for discrete manufacturing.
- **Acme Robotics (ACMR)** — Robotics, Austin, TX. Builds collaborative robotic arms and programming software for contract manufacturers and logistics operators.

Which one did you mean? Once you confirm, I'll pull their filings/transcripts to identify the risk factor they emphasize most.
```

- [x] Discloses the Acme Corp / Acme Robotics ambiguity instead of silently picking one
