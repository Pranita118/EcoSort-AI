import React, { useState } from "react";
import { FileText, UploadCloud, PlusCircle, RefreshCw, CheckCircle2, ChevronDown, ChevronUp, X, Search, FlaskConical } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { knowledgeBase } from "../data/knowledgeBase.js";
import { testRag } from "../services/aiService.js";

const CATEGORY_MAP = {
  "Waste Segregation Guide": null, // all
  "E-Waste Guidelines": "E-Waste",
  "Recycling Guide": "Recyclable Waste",
  "Organic Waste Guide": "Wet / Organic Waste",
  "Hazardous Waste Guide": "Hazardous Waste",
  "Glass Waste Guide": "Glass Waste"
};

export default function KnowledgeBase() {
  const [refreshed, setRefreshed] = useState(false);
  const [openDoc, setOpenDoc] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [customEntries, setCustomEntries] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = React.useRef(null);

  const documents = Object.entries(CATEGORY_MAP).map(([name, category]) => ({
    name,
    category,
    items: category ? knowledgeBase.filter((d) => d.category === category) : knowledgeBase
  }));

  function handleFilePicked(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFiles((f) => [...f, { name: file.name, status: "Pending review" }]);
  }

  return (
    <div className="mx-auto max-w-4xl px-5 pb-20">
      <PageHeader
        eyebrow="Admin view"
        title="Knowledge Base"
        subtitle="A simplified view of how EcoSort's RAG knowledge base would be maintained in production."
      />

      <RagTester />

      <div className="mb-6 flex flex-wrap justify-center gap-3">
        <ActionButton icon={UploadCloud} label="Upload Document" onClick={() => fileInputRef.current?.click()} />
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFilePicked} />
        <ActionButton icon={PlusCircle} label="Add Knowledge" onClick={() => setShowAddForm((v) => !v)} />
        <ActionButton
          icon={RefreshCw}
          label={refreshed ? "Refreshed!" : "Refresh Knowledge Base"}
          onClick={() => {
            setRefreshed(true);
            setTimeout(() => setRefreshed(false), 1500);
          }}
        />
      </div>

      {showAddForm && <AddKnowledgeForm onAdd={(entry) => { setCustomEntries((e) => [...e, entry]); setShowAddForm(false); }} onClose={() => setShowAddForm(false)} />}

      {uploadedFiles.length > 0 && (
        <div className="mb-4 space-y-2">
          {uploadedFiles.map((f, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-clay/25 bg-clay/5 px-4 py-2.5 text-sm">
              <span className="flex items-center gap-2 text-ink"><FileText size={14} className="text-clay" /> {f.name}</span>
              <span className="text-xs font-semibold text-clay">{f.status}</span>
            </div>
          ))}
        </div>
      )}

      {customEntries.length > 0 && (
        <div className="mb-4 space-y-2">
          {customEntries.map((entry, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-forest-400/25 bg-forest-50 px-4 py-2.5 text-sm">
              <span className="font-medium text-forest-900">{entry.item} — {entry.category}</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700"><CheckCircle2 size={12} /> Added (session only)</span>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-forest-100 bg-white">
        {documents.map((d) => {
          const isOpen = openDoc === d.name;
          return (
            <div key={d.name} className="border-b border-forest-100 last:border-b-0">
              <button
                onClick={() => setOpenDoc(isOpen ? null : d.name)}
                className="focus-ring flex w-full items-center justify-between px-5 py-3.5 text-left hover:bg-forest-50/50"
              >
                <span className="flex items-center gap-2 font-medium text-ink">
                  <FileText size={15} className="text-forest-500" /> {d.name}
                  <span className="text-xs font-normal text-ink/40">({d.items.length} items)</span>
                </span>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-50 px-2.5 py-1 text-xs font-semibold text-forest-700">
                    <CheckCircle2 size={12} /> Active
                  </span>
                  {isOpen ? <ChevronUp size={15} className="text-ink/40" /> : <ChevronDown size={15} className="text-ink/40" />}
                </div>
              </button>
              {isOpen && (
                <div className="flex flex-wrap gap-2 bg-paper px-5 py-4">
                  {d.items.slice(0, 12).map((item) => (
                    <span key={item.id} className="rounded-full border border-forest-100 bg-white px-3 py-1 text-xs text-ink/70">
                      {item.item}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-ink/45">
        This prototype uses a local JSON knowledge base ({knowledgeBase.length} records) matched via
        keyword retrieval and passed to Groq as RAG context. In production this would be swapped
        for a vector database with embeddings.
      </p>
    </div>
  );
}

function AddKnowledgeForm({ onAdd, onClose }) {
  const [item, setItem] = useState("");
  const [category, setCategory] = useState("Recyclable Waste");
  const [disposal, setDisposal] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!item.trim() || !disposal.trim()) return;
        onAdd({ item, category, disposal });
      }}
      className="mb-6 rounded-2xl border border-forest-100 bg-white p-5"
    >
      <div className="flex items-center justify-between">
        <p className="font-display text-base font-semibold text-forest-900">Add a knowledge entry</p>
        <button type="button" onClick={onClose} className="focus-ring rounded-full p-1 text-ink/40 hover:text-ink">
          <X size={16} />
        </button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          value={item}
          onChange={(e) => setItem(e.target.value)}
          placeholder="Item name (e.g. bubble wrap)"
          className="focus-ring rounded-xl border border-forest-100 px-3 py-2 text-sm sm:col-span-2"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="focus-ring rounded-xl border border-forest-100 px-3 py-2 text-sm"
        >
          {["Wet / Organic Waste", "Dry Waste", "Recyclable Waste", "E-Waste", "Hazardous Waste", "Glass Waste", "Metal Waste", "Textile Waste", "Sanitary Waste"].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input
          value={disposal}
          onChange={(e) => setDisposal(e.target.value)}
          placeholder="Disposal instruction"
          className="focus-ring rounded-xl border border-forest-100 px-3 py-2 text-sm"
        />
      </div>
      <p className="mt-2 text-xs text-ink/40">This adds to your current session only — it doesn't persist to the actual knowledge base file.</p>
      <button type="submit" className="focus-ring mt-3 rounded-full bg-forest-700 px-5 py-2 text-sm font-semibold text-paper">
        Add entry
      </button>
    </form>
  );
}

function RagTester() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!query.trim()) return;
    setLoading(true);
    const res = await testRag(query);
    setLoading(false);
    setResults(res);
  }

  return (
    <div className="mb-8 rounded-3xl border border-forest-100 bg-white p-6">
      <p className="flex items-center gap-2 font-display text-base font-semibold text-forest-900">
        <FlaskConical size={16} className="text-forest-600" /> Test RAG retrieval
      </p>
      <p className="mt-1 text-sm text-ink/55">
        See exactly which documents get retrieved for a query — this runs the same retrieval step
        used before every classification, with no LLM call (works even without a Groq key).
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
        className="mt-4 flex gap-2"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. how should I handle an old battery?"
          className="focus-ring w-full rounded-full border border-forest-100 px-4 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-full bg-forest-700 px-4 py-2.5 text-sm font-semibold text-paper disabled:opacity-60"
        >
          <Search size={14} /> {loading ? "Testing..." : "Test Retrieval"}
        </button>
      </form>

      {results?.ok && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-forest-700">
            Retrieved {results.results.length} document{results.results.length !== 1 ? "s" : ""}
          </p>
          {results.results.length === 0 ? (
            <p className="text-sm text-ink/50">No documents matched closely enough.</p>
          ) : (
            results.results.map((r) => (
              <div key={r.id} className="rounded-xl border border-forest-100 bg-paper px-4 py-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink">{r.item}</span>
                  <span className="text-xs text-forest-700">match score: {r.matchScore.toFixed(1)}</span>
                </div>
                <p className="mt-0.5 text-xs text-ink/50">{r.category} — {r.source}</p>
              </div>
            ))
          )}
        </div>
      )}
      {results?.ok === false && <p className="mt-3 text-sm text-berry">{results.error}</p>}
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="focus-ring inline-flex items-center gap-2 rounded-full border border-forest-200 bg-white px-4 py-2 text-sm font-semibold text-forest-900 hover:bg-forest-50"
    >
      <Icon size={15} /> {label}
    </button>
  );
}