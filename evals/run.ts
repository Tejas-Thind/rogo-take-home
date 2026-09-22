/**
 * Fires the eval cases at a running agent server and reports which rubric
 * checks pass. Requires `npm run dev:server` (or equivalent) already running
 * on port 8787 — this script doesn't start the server itself, since it's
 * meant to be run against whatever code you currently have checked out.
 *
 * A case's `turns` are sent as separate, independent requests (never as one
 * conversation) because that's exactly what the real server does today —
 * no history is threaded between requests. That makes the follow-up case a
 * faithful test of the current architecture, not a simulation of one we
 * wish existed.
 *
 * Usage: npm run eval -- <label>
 * Writes evals/results/<label>.md, e.g. `npm run eval -- baseline` then
 * later `npm run eval -- after` so the two reports can be compared directly.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { evalCases, type EvalCase } from "./cases.ts";

const SERVER = process.env.EVAL_SERVER ?? "http://localhost:8787";
const label = process.argv[2] ?? "run";

interface CaseResult {
  name: string;
  turns: string[];
  answers: string[];
  ms: number;
  error?: string;
  checks: { description: string; pass: boolean }[];
}

async function askOnce(message: string): Promise<{ answer: string; error?: string }> {
  const res = await fetch(`${SERVER}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => ({}));
    return { answer: "", error: String(data.error ?? `HTTP ${res.status}`) };
  }

  // The server streams newline-delimited JSON events (tool_start, answer,
  // error) rather than one JSON object — same protocol the UI reads.
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer: string | undefined;
  let error: string | undefined;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line);
      if (event.type === "answer") answer = event.answer;
      else if (event.type === "error") error = event.error;
    }
  }

  return { answer: answer ?? "", error };
}

async function runCase(c: EvalCase): Promise<CaseResult> {
  const startedAt = Date.now();
  const answers: string[] = [];
  try {
    for (const turn of c.turns) {
      const { answer, error } = await askOnce(turn);
      if (error) {
        return {
          name: c.name,
          turns: c.turns,
          answers,
          ms: Date.now() - startedAt,
          error,
          checks: c.checks.map((check) => ({ description: check.description, pass: false })),
        };
      }
      answers.push(answer);
    }
    return {
      name: c.name,
      turns: c.turns,
      answers,
      ms: Date.now() - startedAt,
      checks: c.checks.map((check) => ({ description: check.description, pass: check.test(answers) })),
    };
  } catch (err) {
    return {
      name: c.name,
      turns: c.turns,
      answers,
      ms: Date.now() - startedAt,
      error: err instanceof Error ? err.message : String(err),
      checks: c.checks.map((check) => ({ description: check.description, pass: false })),
    };
  }
}

function toMarkdown(results: CaseResult[]): string {
  const allChecks = results.flatMap((r) => r.checks);
  const passed = allChecks.filter((c) => c.pass).length;
  const totalMs = results.reduce((sum, r) => sum + r.ms, 0);

  const lines: string[] = [
    `# Eval run: ${label}`,
    "",
    `${passed}/${allChecks.length} checks passed. Total time: ${(totalMs / 1000).toFixed(1)}s across ${results.length} cases.`,
    "",
  ];

  for (const r of results) {
    const caseCase = evalCases.find((c) => c.name === r.name)!;
    lines.push(`## ${r.name} (${(r.ms / 1000).toFixed(1)}s)`);
    lines.push(`**Target:** ${caseCase.target}`);
    if (caseCase.note) lines.push(`**Note:** ${caseCase.note}`);
    lines.push("");
    for (let i = 0; i < r.turns.length; i++) {
      lines.push(`**Q${r.turns.length > 1 ? i + 1 : ""}:** ${r.turns[i]}`);
      lines.push("");
      lines.push("**Answer:**");
      lines.push("```");
      lines.push(r.answers[i] ?? "(no answer — request failed)");
      lines.push("```");
      lines.push("");
    }
    if (r.error) lines.push(`**Error:** ${r.error}`);
    if (r.checks.length === 0) {
      lines.push("_(no automated checks — read the target and answer above)_");
    }
    for (const check of r.checks) {
      lines.push(`- [${check.pass ? "x" : " "}] ${check.description}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

async function main() {
  console.log(`Running ${evalCases.length} eval cases against ${SERVER}...\n`);
  const results: CaseResult[] = [];

  for (const c of evalCases) {
    process.stdout.write(`  ${c.name}... `);
    const result = await runCase(c);
    results.push(result);
    const passed = result.checks.filter((ch) => ch.pass).length;
    const status = result.error ? `ERROR: ${result.error}` : `${passed}/${result.checks.length} checks passed`;
    console.log(`${status} (${(result.ms / 1000).toFixed(1)}s)`);
  }

  await mkdir("evals/results", { recursive: true });
  const path = `evals/results/${label}.md`;
  await writeFile(path, toMarkdown(results));
  console.log(`\nWrote ${path}`);
}

main();
