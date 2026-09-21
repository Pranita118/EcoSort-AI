import React from "react";
import { CircleDot, WifiOff, KeyRound } from "lucide-react";
import { useApp } from "../services/AppContext.jsx";

export default function StatusBadge() {
  const { apiStatus } = useApp();

  if (!apiStatus.checked) {
    return (
      <span className="flex items-center gap-2 rounded-full border border-forest-100 bg-white px-3 py-1.5 text-xs font-semibold text-ink/50">
        <CircleDot size={12} className="animate-pulse text-ink/30" /> Checking AI server...
      </span>
    );
  }

  if (!apiStatus.connected) {
    return (
      <span
        className="flex items-center gap-2 rounded-full border border-berry/30 bg-berry/10 px-3 py-1.5 text-xs font-semibold text-berry"
        title="Start the backend with: npm run dev (from the project root)"
      >
        <WifiOff size={12} /> Server offline
      </span>
    );
  }

  if (!apiStatus.groqConfigured) {
    return (
      <span
        className="flex items-center gap-2 rounded-full border border-clay/30 bg-clay/10 px-3 py-1.5 text-xs font-semibold text-clay"
        title="Add GROQ_API_KEY to server/.env and restart the server"
      >
        <KeyRound size={12} /> Groq key missing
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2 rounded-full border border-forest-400/30 bg-forest-50 px-3 py-1.5 text-xs font-semibold text-forest-700">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-forest-500 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-forest-500" />
      </span>
      Live · Groq connected
    </span>
  );
}