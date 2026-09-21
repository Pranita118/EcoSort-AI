import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Circle, Trash2, ClipboardList, Sparkles } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import WasteChip from "../components/WasteChip.jsx";
import { useApp } from "../services/AppContext.jsx";

export default function MyList() {
  const { checklist, toggleChecklistItem, removeChecklistItem } = useApp();

  const pending = checklist.filter((c) => !c.done);
  const done = checklist.filter((c) => c.done);

  return (
    <div className="mx-auto max-w-2xl px-5 pb-20">
      <PageHeader
        eyebrow="My Checklist"
        title="Things you still need to dispose of"
        subtitle="Saved from your results — check items off as you actually dispose of them. Stored on this device."
      />

      {checklist.length === 0 ? (
        <div className="rounded-2xl border border-forest-100 bg-white p-8 text-center">
          <ClipboardList className="mx-auto text-forest-400" size={26} />
          <p className="mt-3 text-sm font-semibold text-forest-900">Your checklist is empty</p>
          <p className="mt-1 text-sm text-ink/60">
            Analyze an item, then tap "Save to My Checklist" on the result to track it here.
          </p>
          <Link
            to="/identify"
            className="focus-ring mt-4 inline-flex items-center gap-2 rounded-full bg-forest-700 px-5 py-2.5 text-sm font-semibold text-paper"
          >
            <Sparkles size={15} /> Identify an item
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <Section title={`To dispose (${pending.length})`}>
              {pending.map((c) => (
                <ChecklistRow key={c.id} entry={c} onToggle={toggleChecklistItem} onRemove={removeChecklistItem} />
              ))}
            </Section>
          )}

          {done.length > 0 && (
            <Section title={`Done (${done.length})`}>
              {done.map((c) => (
                <ChecklistRow key={c.id} entry={c} onToggle={toggleChecklistItem} onRemove={removeChecklistItem} />
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ChecklistRow({ entry, onToggle, onRemove }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 ${
        entry.done ? "border-forest-100 bg-forest-50/40 opacity-70" : "border-forest-100 bg-white"
      }`}
    >
      <button
        onClick={() => onToggle(entry.id)}
        className="focus-ring mt-0.5 shrink-0 text-forest-600"
        aria-label={entry.done ? "Mark as not done" : "Mark as done"}
      >
        {entry.done ? <CheckCircle2 size={20} /> : <Circle size={20} className="text-ink/30" />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={`font-medium capitalize text-ink ${entry.done ? "line-through" : ""}`}>{entry.item}</p>
          <WasteChip category={entry.category} />
        </div>
        <p className="mt-1 text-sm text-ink/60">{entry.disposal}</p>
      </div>

      <button
        onClick={() => onRemove(entry.id)}
        className="focus-ring shrink-0 rounded-full p-1.5 text-ink/30 hover:bg-berry/10 hover:text-berry"
        aria-label="Remove from checklist"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}