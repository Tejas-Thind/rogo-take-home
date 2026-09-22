/**
 * The research agent: a tool-use loop over the mocked research tools.
 */

import Anthropic from "@anthropic-ai/sdk";
import { companies } from "./data.ts";
import { executeTool, toolSchemas } from "./tools.ts";

const MODEL = process.env.ROGO_MODEL ?? "claude-sonnet-5";
const MAX_ITERATIONS = 12;

const client = new Anthropic();

const SYSTEM_PROMPT = `You are Rogo Research, an assistant that answers questions about companies for financial analysts.

Use the tools to look up companies, profiles, financials and source documents. Answer the analyst's question directly, then back it up.

Our coverage universe:
${companies
  .map(
    (c) =>
      `- ${c.name} (${c.ticker}) — ${c.sector}, HQ ${c.hq}, ${c.employees} employees. ${c.description}`,
  )
  .join("\n")}

Ground rules:
- If a company reference is ambiguous (a tool will tell you when it is, by naming the candidates), ask the analyst which one they mean rather than guessing. Never silently pick one.
- If a question is about a company outside this coverage universe, say so plainly. Do not state specific figures for it, even with a caveat — you have no sourced data on it, and a caveated guess is still a guess.
- Never state a figure for a fiscal period that hasn't been filed yet. If a tool result includes warnings (delayed filings, unaudited figures, preliminary guidance), relay them wherever that data is used, not only when asked about that company directly — the same caveat applies whether the company is the whole question or just one of several being compared.
- When a document search doesn't turn up something you were asked about, say it isn't in the documents you can search rather than answering from general knowledge.
- Write the final answer directly: plain prose, commas and periods rather than em dashes, tables only when they genuinely clarify a comparison. Spell out a company's full name at least once rather than only using its ticker. Skip filler like restating the question back.`;

export interface ConversationTurn {
  role: "user" | "assistant";
  text: string;
}

/**
 * Builds the initial message array from prior conversation turns plus the
 * new question. Only the prior turns' final text goes in, never their raw
 * tool-call transcripts — that would balloon context size question over
 * question with no bound. If the analyst wants a precise number from
 * earlier, the model can just call the tool again; it's available every
 * turn regardless.
 */
export function buildInitialMessages(
  question: string,
  history: ConversationTurn[] = [],
): Anthropic.MessageParam[] {
  const prior: Anthropic.MessageParam[] = history
    .filter((turn) => turn.text.trim().length > 0)
    .map((turn) => ({ role: turn.role, content: turn.text }));
  return [...prior, { role: "user", content: question }];
}

export type AgentEvent =
  | { type: "iteration"; n: number }
  | { type: "tool_start"; name: string; input: unknown; label: string }
  | { type: "tool_end"; name: string; ms: number }
  | { type: "tool_failed"; name: string; message: string };

export interface AgentResult {
  answer: string;
  iterations: number;
}

function textOf(message: Anthropic.Message): string {
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

/** A short human-readable label for what a tool call is actually doing, for progress display. */
function describeToolCall(name: string, input: unknown): string {
  const i = (input ?? {}) as Record<string, unknown>;
  switch (name) {
    case "searchCompanies":
      return `Searching companies for "${i.query}"`;
    case "getCompanyProfile":
      return `Looking up ${i.company}'s profile`;
    case "getFinancials":
      return `Pulling financials for ${i.company}`;
    case "searchDocuments":
      return i.company
        ? `Searching ${i.company}'s documents for "${i.query}"`
        : `Searching documents for "${i.query}"`;
    default:
      return `Calling ${name}`;
  }
}

async function runToolCall(
  use: Anthropic.ToolUseBlock,
  onEvent: (event: AgentEvent) => void,
): Promise<Anthropic.ToolResultBlockParam> {
  const startedAt = Date.now();
  onEvent({ type: "tool_start", name: use.name, input: use.input, label: describeToolCall(use.name, use.input) });

  try {
    const output = await executeTool(use.name, use.input as Record<string, unknown>);
    onEvent({ type: "tool_end", name: use.name, ms: Date.now() - startedAt });
    return { type: "tool_result", tool_use_id: use.id, content: JSON.stringify(output) };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    onEvent({ type: "tool_failed", name: use.name, message });
    onEvent({ type: "tool_end", name: use.name, ms: Date.now() - startedAt });
    return { type: "tool_result", tool_use_id: use.id, content: message, is_error: true };
  }
}

export async function runAgent(
  question: string,
  history: ConversationTurn[],
  onEvent: (event: AgentEvent) => void,
): Promise<AgentResult> {
  const messages: Anthropic.MessageParam[] = buildInitialMessages(question, history);

  let answer = "";
  let iterations = 0;

  while (iterations < MAX_ITERATIONS) {
    iterations++;
    onEvent({ type: "iteration", n: iterations });

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      // System prompt and tools never change within or across requests, so
      // caching them cuts real cost/latency on any question that needs more
      // than one loop iteration — and can even benefit the very first call
      // of a new question if another one used the same cache recently.
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      tools: toolSchemas,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    const toolUses = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
    );

    if (toolUses.length === 0) {
      answer = textOf(response);
      break;
    }

    // Tool calls in a single turn are independent and read-only, so run them
    // together instead of waiting on each one in sequence.
    const toolResults = await Promise.all(toolUses.map((use) => runToolCall(use, onEvent)));
    messages.push({ role: "user", content: toolResults });
  }

  if (!answer) {
    answer =
      "I looked at a number of sources but ran out of research steps before I could pull the answer together. Try asking a narrower question.";
  }

  return { answer, iterations };
}
