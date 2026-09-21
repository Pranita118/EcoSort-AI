import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Recycle, Cpu, RefreshCw, Boxes, Sparkles } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import PageHeader from "../components/PageHeader.jsx";
import PrototypeBadge from "../components/PrototypeBadge.jsx";
import AnimatedCounter from "../components/AnimatedCounter.jsx";
import { useApp } from "../services/AppContext.jsx";
import { CATEGORY_STYLE } from "../services/classificationService.js";

export default function Impact() {
  const { impact, history } = useApp();

  const stats = [
    { label: "Items Analyzed", value: impact.itemsAnalyzed, icon: Boxes, color: "text-forest-700" },
    { label: "Recyclable Items", value: impact.recyclable, icon: Recycle, color: "text-forest-500" },
    { label: "E-Waste Identified", value: impact.eWaste, icon: Cpu, color: "text-berry" },
    { label: "Reuse Opportunities", value: impact.reuseOpportunities, icon: RefreshCw, color: "text-clay" }
  ];

  const categoryCounts = useMemo(() => {
    const map = {};
    history.forEach((h) => (map[h.category] = (map[h.category] || 0) + 1));
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [history]);

  const hasData = history.length > 0;

  return (
    <div className="mx-auto max-w-4xl px-5 pb-20">
      <PageHeader
        eyebrow="My Sustainability Impact"
        title="Your impact so far"
        subtitle="A live snapshot of what you've actually analyzed with EcoSort AI in this session."
      />

      <div className="mb-5 flex justify-center">
        <PrototypeBadge>Estimated / Prototype Metric</PrototypeBadge>
      </div>

      {!hasData && (
        <div className="mx-auto mb-8 max-w-lg rounded-2xl border border-forest-100 bg-white p-6 text-center">
          <Sparkles className="mx-auto text-forest-500" size={22} />
          <p className="mt-2 text-sm font-semibold text-forest-900">Nothing analyzed yet</p>
          <p className="mt-1 text-sm text-ink/60">
            Your stats fill in automatically as you identify real items — try one now.
          </p>
          <Link
            to="/identify"
            className="focus-ring mt-4 inline-flex items-center gap-2 rounded-full bg-forest-700 px-5 py-2.5 text-sm font-semibold text-paper"
          >
            Identify an item
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-forest-100 bg-white p-6 text-center">
            <s.icon className={`mx-auto ${s.color}`} size={22} />
            <p className="mt-3 font-display text-3xl font-semibold text-forest-900">
              <AnimatedCounter value={s.value} />
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink/50">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-forest-100 bg-forest-50 p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-forest-700">Potential Waste Diversion</p>
        <p className="mt-2 font-display text-4xl font-semibold text-forest-900">
          <AnimatedCounter value={impact.wasteDiversionKg} decimals={1} suffix=" kg" />
        </p>
        <p className="mt-1 text-xs text-ink/50">Estimated, based on typical item weights — not a measured environmental outcome.</p>
      </div>

      {hasData && (
        <div className="mt-6 rounded-2xl border border-forest-100 bg-white p-6">
          <p className="mb-2 font-display text-base font-semibold text-forest-900">Your category breakdown</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={categoryCounts} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {categoryCounts.map((entry) => (
                  <Cell key={entry.name} fill={CATEGORY_STYLE[entry.name]?.color || "#8FAE96"} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}