import React from "react";
import { FlaskConical } from "lucide-react";

export default function PrototypeBadge({ children = "Prototype Demo Data" }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-clay/30 bg-clay/10 px-3 py-1 text-xs font-semibold text-clay">
      <FlaskConical size={12} />
      {children}
    </span>
  );
}
