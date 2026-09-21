import React from "react";
import { useApp } from "../services/AppContext.jsx";
import { Sparkles, FlaskConical } from "lucide-react";

export default function ModeToggle() {
  const { mode, setMode } = useApp();
  const isApi = mode === "api";

  return (
    <button
      onClick={() => setMode(isApi ? "demo" : "api")}
      className="focus-ring flex items-center gap-2 rounded-full border border-forest-100 bg-white px-3 py-1.5 text-xs font-semibold text-forest-900 shadow-sm transition-colors hover:border-forest-400"
      title="Toggle between Demo Mode and live AI/API Mode"
    >
      {isApi ? <Sparkles size={14} className="text-forest-500" /> : <FlaskConical size={14} className="text-clay" />}
      {isApi ? "AI Mode (Groq)" : "Demo Mode"}
    </button>
  );
}
