import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Circle, Trash2, ClipboardList, Sparkles, MessageCircle } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import WasteChip from "../components/WasteChip.jsx";
import { useApp } from "../services/AppContext.jsx";

const ACTION_OPTIONS = ["Reuse / Repair", "Donate", "Recycle", "Keep for later", "Disposed"];
const FILTERS = ["All", "Pending", "Completed"];

export default function MyActions() {
  const { actions, completeAction, removeAction, setActionChoice } = useApp();
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(() => {
    if (filter === "Pending") return actions.filter((a) => a.status !== "completed");
    if (filter === "Completed") return actions.filter((a) => a.status === "completed");
    return actions;
  }, [actions, filter]);

  const completedCount = actions.filter((a) => a.status === "completed").length;

  return (
    <div className="mx-auto max-w-2xl px-5 pb-20">
      <PageHeader
        eyebrow="My Actions"
        title="Things you've decided to do"
        subtitle="Saved from your results — track the action through to completion. Stored on this device."
      />

      {actions.length === 0 ? (
        <div className="rounded-2xl border border-forest-100 bg-white p-8 text-center">
          <ClipboardList className="mx-auto text-forest-400" size={26} />
          <p className="mt-3 text-sm font-semibold text-forest-900">No actions yet</p>
          <p className="mt-1 text-sm text-ink/60">
            Analyze an item, then choose what you want to do with it on the result page.
          </p>
          <Link
            to="/identify"
            className="focus-ring mt-4 inline-flex items-center gap-2 rounded-full bg-forest-700 px-5 py-2.5 text-sm font-semibold text-paper"
          >
            <Sparkles size={15} /> Identify an item
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-5 rounded-2xl border border-forest-100 bg-white p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-forest-900">
                {completedCount} of {actions.length} actions completed
              </span>
              <span className="text-ink/50">{Math.round((completedCount / actions.length) * 100)}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-forest-50">
              <div
                className="h-full rounded-full bg-forest-500 transition-[width] duration-500"
                style={{ width: `${(completedCount / actions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="mb-4 flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`focus-ring rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  filter === f ? "border-forest-500 bg-forest-50 text-forest-700" : "border-forest-100 text-ink/60 hover:border-forest-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filtered.map((entry) => (
              <ActionRow
                key={entry.id}
                entry={entry}
                onToggle={completeAction}
                onRemove={removeAction}
                onChangeAction={setActionChoice}
              />
            ))}
            {filtered.length === 0 && <p className="py-8 text-center text-sm text-ink/40">Nothing in this filter yet.</p>}
          </div>
        </>
      )}
    </div>
  );
}

function ActionRow({ entry, onToggle, onRemove, onChangeAction }) {
  const done = entry.status === "completed";

  return (
    <div className={`rounded-2xl border p-4 ${done ? "border-forest-100 bg-forest-50/40 opacity-70" : "border-forest-100 bg-white"}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(entry.id)}
          className="focus-ring mt-0.5 shrink-0 text-forest-600"
          aria-label={done ? "Mark as not done" : "Mark as done"}
        >
          {done ? <CheckCircle2 size={20} /> : <Circle size={20} className="text-ink/30" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className={`font-medium capitalize text-ink ${done ? "line-through" : ""}`}>{entry.item}</p>
            <WasteChip category={entry.category} />
          </div>
          <p className="mt-1 text-xs text-ink/45">Recommended: {entry.recommendedAction}</p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label className="text-xs text-ink/50">Your action:</label>
            <select
              value={entry.selectedAction || ""}
              onChange={(e) => onChangeAction(entry.id, e.target.value)}
              className="focus-ring rounded-lg border border-forest-100 px-2 py-1 text-xs"
              disabled={done}
            >
              {ACTION_OPTIONS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Link to="/ask-ai" state={{ item: entry.item, category: entry.category }} className="focus-ring rounded-full p-1.5 text-ink/30 hover:bg-forest-50 hover:text-forest-700" aria-label="Ask EcoSort about this">
            <MessageCircle size={15} />
          </Link>
          <button onClick={() => onRemove(entry.id)} className="focus-ring rounded-full p-1.5 text-ink/30 hover:bg-berry/10 hover:text-berry" aria-label="Remove">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}