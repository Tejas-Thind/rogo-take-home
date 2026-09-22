import { describe, expect, it } from "vitest";
import { buildInitialMessages } from "./agent.ts";

describe("buildInitialMessages", () => {
  it("returns just the new question when there's no prior history", () => {
    const messages = buildInitialMessages("What's Acme Corp's revenue?", []);
    expect(messages).toEqual([{ role: "user", content: "What's Acme Corp's revenue?" }]);
  });

  it("defaults to no history when the argument is omitted", () => {
    const messages = buildInitialMessages("What's Acme Corp's revenue?");
    expect(messages).toEqual([{ role: "user", content: "What's Acme Corp's revenue?" }]);
  });

  it("prepends a single prior Q&A pair before the new question, in order", () => {
    const messages = buildInitialMessages("How much of that was organic?", [
      { role: "user", text: "What's Umbrella Health's revenue growth?" },
      { role: "assistant", text: "Revenue grew 9.6% in FY2025, to $4,395M." },
    ]);
    expect(messages).toEqual([
      { role: "user", content: "What's Umbrella Health's revenue growth?" },
      { role: "assistant", content: "Revenue grew 9.6% in FY2025, to $4,395M." },
      { role: "user", content: "How much of that was organic?" },
    ]);
  });

  it("preserves the order of multiple prior turns", () => {
    const messages = buildInitialMessages("Q3", [
      { role: "user", text: "Q1" },
      { role: "assistant", text: "A1" },
      { role: "user", text: "Q2" },
      { role: "assistant", text: "A2" },
    ]);
    expect(messages.map((m) => m.content)).toEqual(["Q1", "A1", "Q2", "A2", "Q3"]);
    expect(messages.map((m) => m.role)).toEqual(["user", "assistant", "user", "assistant", "user"]);
  });

  it("drops empty or whitespace-only history turns instead of sending an invalid empty content block", () => {
    // The Anthropic API rejects messages with empty content outright (seen
    // in practice: "user messages must have non-empty content"). A blank
    // turn could reach here from a failed prior request — never forward it.
    const messages = buildInitialMessages("Q2", [
      { role: "user", text: "Q1" },
      { role: "assistant", text: "   " },
    ]);
    expect(messages).toEqual([
      { role: "user", content: "Q1" },
      { role: "user", content: "Q2" },
    ]);
  });
});
