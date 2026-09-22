import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const EXAMPLES = [
  "Compare Acme and Globex and tell me which one appears to be growing faster.",
  "What are the biggest risks Umbrella Health flags in its filings?",
  "How is Initech's subscription transition going?",
  "Which company in the universe is growing fastest?",
];

/** Parses one server response as newline-delimited JSON events, updating UI state as they arrive. */
async function streamChat(
  question: string,
  onStatus: (label: string) => void,
): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: question }),
  });

  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer: string | undefined;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line);
      if (event.type === "tool_start") {
        onStatus(event.label ?? `Calling ${event.name}…`);
      } else if (event.type === "answer") {
        answer = event.answer;
      } else if (event.type === "error") {
        throw new Error(event.error);
      }
    }
  }

  if (answer === undefined) {
    throw new Error("No answer was returned.");
  }
  return answer;
}

export function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Thinking…");

  async function send(question: string) {
    if (!question.trim() || busy) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setBusy(true);
    setStatus("Thinking…");

    try {
      const answer = await streamChat(question, setStatus);
      setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `Something went wrong: ${err instanceof Error ? err.message : String(err)}` },
      ]);
    }

    setBusy(false);
  }

  return (
    <div className="app">
      <header>
        <h1>Rogo Research</h1>
        <p>Ask a question about a company in our coverage universe.</p>
      </header>

      <div className="transcript">
        {messages.length === 0 && (
          <div className="examples">
            {EXAMPLES.map((example) => (
              <button key={example} onClick={() => send(example)}>
                {example}
              </button>
            ))}
          </div>
        )}

        {messages.map((message, i) =>
          message.role === "assistant" ? (
            <div key={i} className="bubble assistant">
              <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>
          ) : (
            <div key={i} className="bubble user">
              {message.text}
            </div>
          ),
        )}

        {busy && <div className="bubble assistant pending">{status}</div>}
      </div>

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a research question…"
          disabled={busy}
        />
        <button type="submit" disabled={busy}>
          Send
        </button>
      </form>
    </div>
  );
}
