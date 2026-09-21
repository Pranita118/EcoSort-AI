import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, MessageCircle, Camera, Type, ScanSearch, BookOpenCheck, Sparkle, Boxes, ClipboardList, RefreshCw } from "lucide-react";
import { demoExamples } from "../data/demoExamples.js";
import WasteChip from "../components/WasteChip.jsx";
import { useApp } from "../services/AppContext.jsx";

const PIPELINE = [
  { label: "User Input", icon: Type, desc: "Describe an item or upload a photo" },
  { label: "AI Understanding", icon: ScanSearch, desc: "The item is parsed and matched" },
  { label: "Knowledge Retrieval", icon: BookOpenCheck, desc: "Relevant guidance is pulled from the KB" },
  { label: "Recommendation", icon: Sparkle, desc: "A clear disposal decision is generated" }
];

export default function Home() {
  const { impact, history, actions } = useApp();
  const navigate = useNavigate();
  const hasActivity = impact.itemsAnalyzed > 0;
  const pendingActions = actions.filter((a) => a.status !== "completed").slice(0, 3);
  const recentDecisions = history.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-16 lg:grid-cols-2 lg:pt-24">
          <div>
            <p className="type-eyebrow text-sm">AI-powered · SDG 12 aligned</p>
            <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.05] text-forest-900 sm:text-6xl">
              What do you have
              <br />
              to dispose of?
            </h1>
            <p className="mt-5 max-w-md text-lg text-ink/70">
              EcoSort AI identifies your item, checks relevant guidance, and helps you decide
              what to do next — not just what category it belongs to.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/identify"
                className="inline-flex items-center gap-2 rounded-full bg-forest-700 px-6 py-3.5 text-sm font-semibold text-paper shadow-soft transition-transform hover:-translate-y-0.5"
              >
                <Camera size={16} /> Identify My Waste
              </Link>
              <Link
                to="/ask-ai"
                className="inline-flex items-center gap-2 rounded-full border border-forest-700/30 px-6 py-3.5 text-sm font-semibold text-forest-900 transition-colors hover:bg-forest-50"
              >
                <MessageCircle size={16} /> Ask EcoSort AI
              </Link>
            </div>

            <div className="mt-10">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">Quick start</p>
              <div className="flex flex-wrap gap-2">
                {demoExamples.map((ex) => (
                  <Link
                    key={ex.label}
                    to={`/identify?q=${encodeURIComponent(ex.query)}&auto=1`}
                    className="rounded-full border border-forest-100 bg-white px-3.5 py-1.5 text-xs font-medium text-ink/70 transition-colors hover:border-forest-400 hover:text-forest-700"
                  >
                    {ex.icon} {ex.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <HeroVisual />
        </div>
      </section>

      {/* Your Eco Activity */}
      <section className="border-y border-forest-100 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <h2 className="font-display text-2xl font-semibold text-forest-900">Your Eco Activity</h2>

          {!hasActivity ? (
            <div className="mt-6 rounded-2xl border border-forest-100 bg-paper p-8 text-center">
              <p className="text-ink/60">Your journey starts with your first item.</p>
              <Link
                to="/identify"
                className="focus-ring mt-4 inline-flex items-center gap-2 rounded-full bg-forest-700 px-6 py-3 text-sm font-semibold text-paper"
              >
                <Sparkle size={15} /> Analyze Your First Item
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-forest-100 bg-paper p-5">
                <Boxes className="text-forest-600" size={20} />
                <p className="mt-2 font-display text-2xl font-semibold text-forest-900">{impact.itemsAnalyzed}</p>
                <p className="text-xs text-ink/50">Items analyzed</p>
              </div>
              <div className="rounded-2xl border border-forest-100 bg-paper p-5">
                <RefreshCw className="text-clay" size={20} />
                <p className="mt-2 font-display text-2xl font-semibold text-forest-900">{impact.reuseOpportunities}</p>
                <p className="text-xs text-ink/50">Reuse opportunities</p>
              </div>
              <div className="rounded-2xl border border-forest-100 bg-paper p-5">
                <ClipboardList className="text-forest-600" size={20} />
                <p className="mt-2 font-display text-2xl font-semibold text-forest-900">
                  {actions.filter((a) => a.status === "completed").length} / {actions.length || 0}
                </p>
                <p className="text-xs text-ink/50">Actions completed</p>
              </div>
            </div>
          )}

          {(recentDecisions.length > 0 || pendingActions.length > 0) && (
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {recentDecisions.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">Recent decisions</p>
                  <div className="space-y-2">
                    {recentDecisions.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => navigate("/results", { state: { result: h.result, viaImage: h.result?.viaImage } })}
                        className="focus-ring flex w-full items-center justify-between rounded-xl border border-forest-100 bg-paper px-4 py-2.5 text-left hover:border-forest-400"
                      >
                        <span className="truncate text-sm font-medium capitalize text-ink">{h.item}</span>
                        <WasteChip category={h.category} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {pendingActions.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">Continue where you left off</p>
                  <div className="space-y-2">
                    {pendingActions.map((a) => (
                      <Link
                        key={a.id}
                        to="/my-actions"
                        className="focus-ring flex items-center justify-between rounded-xl border border-forest-100 bg-paper px-4 py-2.5 hover:border-forest-400"
                      >
                        <span className="truncate text-sm font-medium capitalize text-ink">{a.item}</span>
                        <span className="text-xs text-forest-700">{a.selectedAction}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Why EcoSort */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-display text-3xl font-semibold text-forest-900">Why EcoSort AI?</h2>
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <div className="rounded-2xl border border-berry/15 bg-berry/5 p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-berry">Without guidance</p>
            <ol className="mt-4 space-y-3 text-ink/75">
              <li>1. Wrong segregation</li>
              <li>2. Contaminated recyclables</li>
              <li>3. More landfill waste</li>
              <li>4. Greater environmental impact</li>
            </ol>
          </div>
          <div className="rounded-2xl border border-forest-400/20 bg-forest-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-forest-700">With EcoSort AI</p>
            <ol className="mt-4 space-y-3 text-ink/75">
              <li>1. Better identification</li>
              <li>2. Better decisions</li>
              <li>3. More responsible disposal</li>
              <li>4. Measurable, educational impact</li>
            </ol>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-forest-100 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-3xl font-semibold text-forest-900">How EcoSort AI works</h2>
          <p className="mt-2 max-w-xl text-ink/65">
            Every recommendation follows the same explainable pipeline — no black boxes.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PIPELINE.map((step, i) => (
              <div key={step.label} className="relative rounded-2xl border border-forest-100 bg-paper p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest-50 text-forest-700">
                    <step.icon size={18} />
                  </span>
                  <p className="font-display text-base font-semibold text-forest-900">{step.label}</p>
                </div>
                <p className="mt-3 text-sm text-ink/60">{step.desc}</p>
                {i < PIPELINE.length - 1 && (
                  <ArrowRight
                    size={18}
                    className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-forest-400/60 lg:block"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SDG strip */}
      <section className="bg-forest-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-5 py-10 text-paper">
          <p className="font-display text-lg">Aligned with the UN Sustainable Development Goals</p>
          <div className="flex flex-wrap gap-3">
            {[
              ["SDG 12", "Responsible Consumption & Production"],
              ["SDG 11", "Sustainable Cities & Communities"],
              ["SDG 13", "Climate Action"]
            ].map(([tag, desc]) => (
              <div key={tag} className="rounded-xl border border-white/15 px-4 py-3">
                <p className="font-display text-sm font-semibold">{tag}</p>
                <p className="text-xs text-paper/60">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <div className="absolute inset-0 rounded-blob bg-forest-100 animate-float" />
      <div className="absolute inset-6 rounded-blob border border-forest-400/30 animate-float" style={{ animationDelay: "-3s" }} />
      <svg viewBox="0 0 300 300" className="relative h-full w-full" role="img" aria-label="Illustration of household waste being sorted by AI into correct bins">
        <text x="150" y="52" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" fill="#357A52" fontWeight="600">
          AI Identification
        </text>
        <g transform="translate(150,128)">
          <circle r="44" fill="#14322A" />
          <circle r="44" fill="none" stroke="#F7F5EF" strokeOpacity="0.15" strokeWidth="10" />
          <path d="M -17 -3 L -4 11 L 19 -15" stroke="#F7F5EF" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <line x1="150" y1="172" x2="150" y2="200" stroke="#357A52" strokeWidth="2" strokeDasharray="4 5" />
        <g>
          <rect x="40" y="215" width="42" height="45" rx="8" fill="#8FAE96" />
          <rect x="95" y="200" width="42" height="60" rx="8" fill="#357A52" />
          <rect x="150" y="222" width="42" height="38" rx="8" fill="#C97A3D" />
          <rect x="205" y="208" width="42" height="52" rx="8" fill="#3B5B9C" />
        </g>
      </svg>
    </div>
  );
}