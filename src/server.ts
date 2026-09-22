import "dotenv/config";
import express from "express";
import { runAgent, type ConversationTurn } from "./agent.ts";

if (!process.env.ANTHROPIC_API_KEY) {
  console.error(
    "\nANTHROPIC_API_KEY is not set.\nCopy .env.example to .env and add your key, then run `npm run dev` again.\n",
  );
  process.exit(1);
}

const app = express();
app.use(express.json());

/** Never trust the client's history payload blindly — drop anything malformed rather than error out. */
function parseHistory(input: unknown): ConversationTurn[] {
  if (!Array.isArray(input)) return [];
  return input.filter(
    (turn): turn is ConversationTurn =>
      typeof turn === "object" &&
      turn !== null &&
      (turn.role === "user" || turn.role === "assistant") &&
      typeof turn.text === "string",
  );
}

app.post("/api/chat", async (req, res) => {
  const message = typeof req.body.message === "string" ? req.body.message.trim() : "";
  if (!message) {
    res.status(400).json({ error: "message is required" });
    return;
  }
  const history = parseHistory(req.body.history);
  console.log(`\n[chat] ${message}${history.length ? ` (with ${history.length} prior turns)` : ""}`);

  res.setHeader("Content-Type", "application/x-ndjson");
  res.setHeader("Cache-Control", "no-cache");
  const send = (event: unknown) => res.write(`${JSON.stringify(event)}\n`);

  try {
    const result = await runAgent(message, history, (event) => {
      switch (event.type) {
        case "iteration":
          console.log(`[agent] iteration ${event.n}`);
          break;
        case "tool_start":
          console.log(`[tool]  → ${event.name} ${JSON.stringify(event.input)}`);
          send(event);
          break;
        case "tool_end":
          console.log(`[tool]  ← ${event.name} (${event.ms}ms)`);
          break;
        case "tool_failed":
          console.log(`[tool]  ! ${event.name}: ${event.message}`);
          send(event);
          break;
      }
    });

    send({ type: "answer", answer: result.answer });
  } catch (err) {
    console.error(err);
    send({ type: "error", error: "Something went wrong answering that question. Please try again." });
  } finally {
    res.end();
  }
});

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => {
  console.log(`Agent server listening on http://localhost:${port}`);
});
