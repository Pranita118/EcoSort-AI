import React from "react";
import { WifiOff, KeyRound, Terminal } from "lucide-react";
import { useApp } from "../services/AppContext.jsx";

export default function SetupNotice() {
  const { apiStatus } = useApp();

  if (!apiStatus.checked || apiStatus.connected === undefined) return null;

  if (!apiStatus.connected) {
    return (
      <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-berry/25 bg-berry/5 p-5 text-sm text-berry">
        <p className="flex items-center gap-2 font-semibold">
          <WifiOff size={16} /> EcoSort AI server isn't reachable
        </p>
        <p className="mt-2 text-ink/70">
          The backend that talks to Groq isn't running. From the project root (the folder
          containing both <code className="rounded bg-white/60 px-1">client</code> and{" "}
          <code className="rounded bg-white/60 px-1">server</code>), run:
        </p>
        <pre className="mt-2 flex items-center gap-2 overflow-x-auto rounded-lg bg-forest-900 px-3 py-2 text-xs text-paper">
          <Terminal size={12} className="shrink-0" /> npm run dev
        </pre>
        <p className="mt-2 text-xs text-ink/50">This page will reconnect automatically once the server is running.</p>
      </div>
    );
  }

  if (!apiStatus.groqConfigured) {
    return (
      <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-clay/25 bg-clay/5 p-5 text-sm text-clay">
        <p className="flex items-center gap-2 font-semibold">
          <KeyRound size={16} /> Groq API key not configured
        </p>
        <p className="mt-2 text-ink/70">
          The server is running but has no Groq key. Add one to{" "}
          <code className="rounded bg-white/60 px-1">server/.env</code>:
        </p>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-forest-900 px-3 py-2 text-xs text-paper">
          GROQ_API_KEY=your_real_key_here
        </pre>
        <p className="mt-2 text-xs text-ink/50">
          Get a free key at console.groq.com, then restart the server.
        </p>
      </div>
    );
  }

  return null;
}