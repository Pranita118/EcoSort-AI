import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Sprout, Send, User, BookOpenCheck, AlertTriangle } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import SetupNotice from "../components/SetupNotice.jsx";
import { askEcoSort } from "../services/aiService.js";

const GENERIC_STARTERS = [
  "Can I recycle this plastic bottle?",
  "Where should I dispose of batteries?",
  "What should I do with an old laptop?",
  "Is food waste recyclable?"
];

export default function AskAI() {
  const { state } = useLocation();
  const contextItem = state?.item || null;
  const contextCategory = state?.category || null;
  const context = contextItem ? `The user just analyzed "${contextItem}", classified as ${contextCategory}.` : null;

  const intro = contextItem
    ? {
        role: "assistant",
        text: `I can help you decide what to do with your ${contextItem}. Ask me anything about it, or pick a suggestion below.`
      }
    : {
        role: "assistant",
        text: "Ask me anything about waste segregation and disposal — I'll answer live using Groq, grounded in EcoSort's knowledge base."
      };

  const starters = contextItem
    ? [
        `Can I donate this ${contextItem}?`,
        `What if it's damaged?`,
        `How should I handle the battery?`,
        `What should I avoid doing with it?`
      ]
    : GENERIC_STARTERS;

  const [messages, setMessages] = useState([intro]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(question) {
    const q = (question ?? input).trim();
    if (!q) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);
    const res = await askEcoSort(q, context);
    setLoading(false);

    if (res.ok === false) {
      setMessages((m) => [...m, { role: "error", text: res.error }]);
      return;
    }
    setMessages((m) => [...m, { role: "assistant", text: res.answer, source: res.sourceLabel }]);
  }

  return (
    <div className="mx-auto max-w-3xl px-5 pb-16">
      <PageHeader
        eyebrow="Ask EcoSort"
        title="Ask EcoSort AI"
        subtitle="A conversational assistant, answered live by Groq and grounded in EcoSort's waste-management knowledge base."
      />

      <SetupNotice />

      <div className="rounded-3xl border border-forest-100 bg-white shadow-soft">
        <div ref={scrollRef} className="max-h-[28rem] space-y-4 overflow-y-auto p-5 sm:p-6">
          {messages.map((m, i) => (
            <ChatBubble key={i} message={m} />
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-ink/50">
              <Sprout size={16} className="text-forest-500" /> EcoSort AI is thinking...
            </div>
          )}
        </div>

        <div className="border-t border-forest-100 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2"
          >
            <label htmlFor="chat-input" className="sr-only">Type your question</label>
            <input
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="focus-ring w-full rounded-full border border-forest-100 bg-paper px-4 py-2.5 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest-700 text-paper disabled:opacity-50"
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {starters.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            className="focus-ring rounded-full border border-forest-100 bg-white px-3.5 py-1.5 text-xs font-medium text-ink/65 hover:border-forest-400 hover:text-forest-700"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatBubble({ message }) {
  const isUser = message.role === "user";
  const isError = message.role === "error";

  if (isError) {
    return (
      <div className="flex gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-berry/10 text-berry">
          <AlertTriangle size={15} />
        </span>
        <div className="max-w-[80%] rounded-2xl bg-berry/5 px-4 py-2.5 text-sm text-berry">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse text-right" : ""}`}>
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
          isUser ? "bg-forest-100 text-forest-700" : "bg-forest-700 text-paper"
        }`}
      >
        {isUser ? <User size={15} /> : <Sprout size={15} />}
      </span>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${isUser ? "bg-forest-50 text-ink" : "bg-paper text-ink"}`}>
        <p className="whitespace-pre-line leading-relaxed">{message.text}</p>
        {message.source && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-forest-700">
            <BookOpenCheck size={12} /> Source: {message.source}
          </p>
        )}
      </div>
    </div>
  );
}