import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from "recharts";
import { Sparkles, ThumbsUp, ThumbsDown } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import PrototypeBadge from "../components/PrototypeBadge.jsx";
import AnimatedCounter from "../components/AnimatedCounter.jsx";
import { useApp } from "../services/AppContext.jsx";
import { CATEGORY_STYLE } from "../services/classificationService.js";

export default function Analytics() {
  const { history, feedback } = useApp();

  const categoryCounts = useMemo(() => {
    const map = {};
    history.forEach((h) => (map[h.category] = (map[h.category] || 0) + 1));
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [history]);

  const lowConfidence = history.filter((h) => h.confidence < 45).length;
  const eWasteCount = history.filter((h) => h.category === "E-Waste").length;
  const recyclableCount = history.filter((h) =>
    ["Recyclable Waste", "Dry Waste", "Glass Waste", "Metal Waste"].includes(h.category)
  ).length;

  const topItems = useMemo(() => {
    const map = {};
    history.forEach((h) => (map[h.item] = (map[h.item] || 0) + 1));
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [history]);

  const uncertainItems = useMemo(() => {
    const map = {};
    history
      .filter((h) => h.confidence < 45)
      .forEach((h) => (map[h.item] = (map[h.item] || 0) + 1));
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [history]);

  const thumbsUp = feedback.filter((f) => f.isCorrect).length;
  const thumbsDown = feedback.filter((f) => !f.isCorrect).length;

  const metrics = [
    { label: "Total Analyses", value: history.length },
    { label: "E-Waste Queries", value: eWasteCount },
    { label: "Recyclable Queries", value: recyclableCount },
    { label: "Low Confidence Queries", value: lowConfidence }
  ];

  return (
    <div className="mx-auto max-w-5xl px-5 pb-20">
      <PageHeader
        eyebrow="Analytics"
        title="Prototype usage analytics"
        subtitle="Session-level metrics showing how EcoSort AI is being used."
      />

      <div className="mb-6 flex justify-center">
        <PrototypeBadge>Prototype Demo Data</PrototypeBadge>
      </div>

      {history.length === 0 && (
        <div className="mx-auto mb-8 max-w-lg rounded-2xl border border-forest-100 bg-white p-6 text-center">
          <Sparkles className="mx-auto text-forest-500" size={22} />
          <p className="mt-2 text-sm font-semibold text-forest-900">No analyses yet this session</p>
          <p className="mt-1 text-sm text-ink/60">
            These charts populate live as real items are analyzed via Groq.
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
        {metrics.map((m) => (
          <div key={m.label} className="rounded-2xl border border-forest-100 bg-white p-5 text-center">
            <p className="font-display text-3xl font-semibold text-forest-900">
              <AnimatedCounter value={m.value} />
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink/50">{m.label}</p>
          </div>
        ))}
      </div>

      {history.length > 0 && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <ChartCard title="Waste Category Distribution">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryCounts} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {categoryCounts.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_STYLE[entry.name]?.color || "#8FAE96"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top Waste Items">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topItems} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EEF4EF" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#357A52" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {(uncertainItems.length > 0 || feedback.length > 0) && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {uncertainItems.length > 0 && (
            <div className="rounded-2xl border border-forest-100 bg-white p-5">
              <p className="mb-3 font-display text-base font-semibold text-forest-900">Where EcoSort was uncertain</p>
              <div className="space-y-2">
                {uncertainItems.map((u) => (
                  <div key={u.name} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-ink/70">{u.name}</span>
                    <span className="text-xs font-semibold text-clay">{u.count}×</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-ink/40">Items with a low-confidence result — a real AI-quality signal, not a vanity metric.</p>
            </div>
          )}

          {feedback.length > 0 && (
            <div className="rounded-2xl border border-forest-100 bg-white p-5">
              <p className="mb-3 font-display text-base font-semibold text-forest-900">User feedback received</p>
              <div className="flex gap-6">
                <div className="flex items-center gap-2 text-sm">
                  <ThumbsUp size={16} className="text-forest-600" /> {thumbsUp} confirmed correct
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ThumbsDown size={16} className="text-berry" /> {thumbsDown} corrections
                </div>
              </div>
              <p className="mt-3 text-xs text-ink/40">Collected from the 👍/👎 on each result — human-in-the-loop signal, not a formal accuracy evaluation.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-forest-100 bg-white p-5">
      <p className="mb-2 font-display text-base font-semibold text-forest-900">{title}</p>
      {children}
    </div>
  );
}