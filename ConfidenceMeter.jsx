import React from "react";
import AnimatedCounter from "./AnimatedCounter.jsx";

const LEVEL_COLOR = {
  high: "#357A52",
  medium: "#C97A3D",
  low: "#B5482E"
};

export default function ConfidenceMeter({ score, level, label }) {
  const color = LEVEL_COLOR[level] || LEVEL_COLOR.medium;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-display text-3xl font-semibold text-forest-900">
          <AnimatedCounter value={score} suffix="%" />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
          {level} confidence
        </span>
      </div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-forest-50">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <p className="mt-2 text-sm text-ink/70">{label}</p>
    </div>
  );
}
