import React, { useState } from "react";
import { ChevronDown, ChevronUp, Scale } from "lucide-react";

const OPTIONS = [
  {
    option: "Reuse",
    value: "Extends the item's life with zero extra resources",
    effort: "Low",
    nextStep: "Use it yourself or find someone who can",
    excludeCategories: ["Hazardous Waste", "Sanitary Waste", "Wet / Organic Waste"]
  },
  {
    option: "Repair",
    value: "Avoids manufacturing a replacement",
    effort: "Medium",
    nextStep: "Check if a local repair service or part swap is practical",
    excludeCategories: ["Hazardous Waste", "Sanitary Waste", "Wet / Organic Waste", "Dry Waste"]
  },
  {
    option: "Donate",
    value: "Someone else gets use from it instead of buying new",
    effort: "Low",
    nextStep: "Find a local donation point or give it to someone who needs it",
    excludeCategories: ["Hazardous Waste", "Sanitary Waste", "Wet / Organic Waste"]
  },
  {
    option: "Recycle",
    value: "Recovers raw materials instead of landfilling them",
    effort: "Low",
    nextStep: "Use the appropriate recycling stream for this material",
    excludeCategories: []
  },
  {
    option: "Special / Dispose",
    value: "Last resort — only when nothing above is suitable",
    effort: "Low",
    nextStep: "Use certified hazardous/e-waste disposal, or general waste only if truly unavoidable",
    excludeCategories: []
  }
];

export default function CompareOptions({ category }) {
  const [open, setOpen] = useState(false);
  const relevant = OPTIONS.filter((o) => !o.excludeCategories.includes(category));

  return (
    <div className="mt-6 rounded-3xl border border-forest-100 bg-white p-6">
      <button onClick={() => setOpen((v) => !v)} className="focus-ring flex w-full items-center justify-between text-left">
        <span className="flex items-center gap-2 text-sm font-semibold text-forest-900">
          <Scale size={16} /> Compare my options
        </span>
        {open ? <ChevronUp size={16} className="text-ink/40" /> : <ChevronDown size={16} className="text-ink/40" />}
      </button>

      {open && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                <th className="pb-2 pr-3">Option</th>
                <th className="pb-2 pr-3">Value</th>
                <th className="pb-2 pr-3">Effort</th>
                <th className="pb-2">Next step</th>
              </tr>
            </thead>
            <tbody>
              {relevant.map((o) => (
                <tr key={o.option} className="border-t border-forest-100">
                  <td className="py-2.5 pr-3 font-medium text-forest-900">{o.option}</td>
                  <td className="py-2.5 pr-3 text-ink/65">{o.value}</td>
                  <td className="py-2.5 pr-3 text-ink/65">{o.effort}</td>
                  <td className="py-2.5 text-ink/65">{o.nextStep}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-ink/40">
            General guidance to support your decision — not a precise environmental measurement.
          </p>
        </div>
      )}
    </div>
  );
}