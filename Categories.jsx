import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Search, Sparkles } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import WasteChip from "../components/WasteChip.jsx";
import { WASTE_CATEGORIES } from "../services/classificationService.js";
import { knowledgeBase } from "../data/knowledgeBase.js";

const DESCRIPTIONS = {
  "Wet / Organic Waste": "Biodegradable kitchen and food scraps that break down naturally and can be composted.",
  "Dry Waste": "Non-biodegradable household items such as paper, cardboard, and packaging that don't fit a special category.",
  "Recyclable Waste": "Materials like clean plastics and cartons that can be reprocessed into new products.",
  "E-Waste": "Discarded electronic products and accessories that need certified recycling.",
  "Hazardous Waste": "Items containing chemicals, batteries, or solvents that require careful, specialized handling.",
  "Glass Waste": "Bottles and jars that are fully recyclable but need to be handled separately from other materials.",
  "Metal Waste": "Cans and metal objects that retain high recycling value.",
  "Textile Waste": "Clothing, shoes, and fabric items best diverted through reuse or donation.",
  "Sanitary Waste": "Personal hygiene items that must be isolated from recyclables for safety.",
  "Other / Uncertain": "Items that don't clearly fit a standard category and need extra care or local guidance."
};

export default function Categories() {
  const [open, setOpen] = useState(null);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const grouped = useMemo(() => {
    const map = {};
    WASTE_CATEGORIES.forEach((c) => (map[c] = []));
    knowledgeBase.forEach((doc) => {
      if (map[doc.category]) map[doc.category].push(doc);
    });
    return map;
  }, []);

  const visibleCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return WASTE_CATEGORIES;
    return WASTE_CATEGORIES.filter((cat) => {
      if (cat.toLowerCase().includes(q)) return true;
      return (grouped[cat] || []).some((item) => item.item.toLowerCase().includes(q));
    });
  }, [query, grouped]);

  function analyzeExample(itemName) {
    navigate(`/identify?q=${encodeURIComponent(itemName)}&auto=1`);
  }

  return (
    <div className="mx-auto max-w-5xl px-5 pb-20">
      <PageHeader
        eyebrow="Reference"
        title="Explore Waste Categories"
        subtitle="Ten categories cover almost everything you'll ever need to throw away. Search, tap a card for details, or tap any example to analyze it live."
      />

      <div className="relative mx-auto mb-8 max-w-md">
        <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a category or item (e.g. 'battery', 'glass')..."
          className="focus-ring w-full rounded-full border border-forest-100 bg-white py-2.5 pl-10 pr-4 text-sm"
        />
      </div>

      {visibleCategories.length === 0 && (
        <p className="text-center text-sm text-ink/50">No categories or items match "{query}".</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {visibleCategories.map((cat) => {
          const items = grouped[cat] || [];
          const isOpen = open === cat;
          return (
            <div key={cat} className="rounded-2xl border border-forest-100 bg-white p-5">
              <button
                onClick={() => setOpen(isOpen ? null : cat)}
                className="focus-ring flex w-full items-center justify-between text-left"
              >
                <WasteChip category={cat} size="lg" />
                {isOpen ? <ChevronUp size={18} className="text-ink/40" /> : <ChevronDown size={18} className="text-ink/40" />}
              </button>

              <p className="mt-3 text-sm text-ink/60">{DESCRIPTIONS[cat]}</p>

              {isOpen && (
                <div className="mt-4 space-y-4 border-t border-forest-100 pt-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-forest-700">
                      Examples — tap to analyze live
                    </p>
                    {items.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {items.slice(0, 8).map((i) => (
                          <button
                            key={i.id}
                            onClick={() => analyzeExample(i.item)}
                            className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-forest-100 bg-paper px-3 py-1.5 text-xs font-medium text-ink/70 transition-colors hover:border-forest-400 hover:text-forest-700"
                          >
                            <Sparkles size={11} className="text-forest-500" /> {i.item}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-ink/70">See local guide for examples.</p>
                    )}
                  </div>
                  {items[0] && (
                    <>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-forest-700">What to do</p>
                        <p className="mt-1 text-sm text-ink/70">{items[0].disposal}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-clay">What to avoid</p>
                        <p className="mt-1 text-sm text-ink/70">{items[0].avoid}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}