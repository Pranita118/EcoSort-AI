import React from "react";
import {
  Leaf,
  Package,
  Recycle,
  Cpu,
  TriangleAlert,
  Wine,
  Nut,
  Shirt,
  Droplets,
  HelpCircle
} from "lucide-react";
import { CATEGORY_STYLE } from "../services/classificationService.js";

const ICONS = {
  leaf: Leaf,
  package: Package,
  recycle: Recycle,
  cpu: Cpu,
  "triangle-alert": TriangleAlert,
  wine: Wine,
  nut: Nut,
  shirt: Shirt,
  droplets: Droplets,
  "help-circle": HelpCircle
};

export default function WasteChip({ category, size = "md" }) {
  const style = CATEGORY_STYLE[category] || CATEGORY_STYLE["Other / Uncertain"];
  const Icon = ICONS[style.icon] || HelpCircle;
  const padding = size === "lg" ? "px-4 py-2 text-sm" : "px-3 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${padding}`}
      style={{ color: style.color, backgroundColor: style.bg }}
    >
      <Icon size={size === "lg" ? 16 : 13} />
      {category}
    </span>
  );
}
