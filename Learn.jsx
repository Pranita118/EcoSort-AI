import React, { useState } from "react";
import { Recycle, Home, Cpu, RefreshCw, AlertTriangle, ChevronDown, ChevronUp, Trophy, RotateCcw } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";

const ARTICLES = [
  {
    icon: Recycle,
    title: "5 ways to reduce plastic waste",
    text: "Carry a reusable bottle and bag, avoid single-use cutlery, choose refillable products, buy in bulk, and say no to unnecessary packaging.",
    more: "Small swaps compound fast: a reusable bottle alone can replace hundreds of single-use ones a year. When you can't avoid plastic, favor items marked with recycling codes 1 (PET) or 2 (HDPE) — they're the most widely accepted by recycling programs. Buying concentrated or bulk goods also cuts packaging weight per use dramatically."
  },
  {
    icon: Home,
    title: "How to segregate waste at home",
    text: "Keep three separate bins — wet, dry, and hazardous — and rinse recyclables before placing them in the dry bin.",
    more: "Label each bin clearly so everyone in the household sorts consistently. A quick rinse prevents food residue from contaminating an entire batch of otherwise-recyclable dry waste. Keep a small separate container for batteries and e-waste so they never end up mixed in by accident."
  },
  {
    icon: Cpu,
    title: "Why e-waste needs special handling",
    text: "Electronics contain metals and chemicals that can contaminate soil and water if dumped, but can be safely recovered through certified recyclers.",
    more: "A single circuit board can contain gold, copper, and rare earth elements worth recovering — but also lead and mercury that are hazardous if it ends up in a landfill. Certified e-waste recyclers extract the valuable materials safely and neutralize the hazardous ones, which informal dumping simply can't do."
  },
  {
    icon: RefreshCw,
    title: "How reuse reduces waste",
    text: "Every item reused is one less item manufactured, transported, and eventually discarded — reuse often beats recycling for impact.",
    more: "Recycling still consumes energy and water to reprocess materials. Reuse skips that step entirely — a repaired appliance or a donated jacket avoids the emissions of manufacturing a replacement from scratch. That's why the waste hierarchy always ranks reuse above recycling."
  },
  {
    icon: AlertTriangle,
    title: "Common waste segregation mistakes",
    text: "Mixing food-soiled containers with dry recyclables, tossing batteries in the trash, and not rinsing containers are common contamination sources.",
    more: "Even one greasy pizza box can contaminate an entire bag of otherwise-recyclable paper. Batteries and small electronics are especially risky in general trash because they can spark fires in collection trucks. When in doubt about an item, it's safer to check (or ask EcoSort) than to guess."
  }
];

const QUIZ = [
  {
    q: "Which bin should a banana peel go in?",
    options: ["Dry waste", "Wet / Organic waste", "Recyclable waste"],
    answer: 1
  },
  {
    q: "Why shouldn't batteries go in regular household waste?",
    options: [
      "They're too heavy for the bin",
      "They contain chemicals/metals that can leak and are a fire risk",
      "They smell bad"
    ],
    answer: 1
  },
  {
    q: "What's the best first option for a laptop that still works?",
    options: ["Throw it away", "Reuse, repair, or donate it", "Burn it"],
    answer: 1
  },
  {
    q: "What should you do with a plastic bottle before recycling it?",
    options: ["Nothing, just toss it in", "Rinse it out", "Melt it yourself"],
    answer: 1
  }
];

export default function Learn() {
  const [openArticle, setOpenArticle] = useState(null);

  return (
    <div className="mx-auto max-w-5xl px-5 pb-20">
      <PageHeader
        eyebrow="Learn & Act"
        title="Build better waste habits"
        subtitle="Short, practical reads — tap any card to go deeper — plus a quick quiz to test what you've picked up."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ARTICLES.map((a, i) => {
          const isOpen = openArticle === i;
          return (
            <button
              key={a.title}
              onClick={() => setOpenArticle(isOpen ? null : i)}
              className="focus-ring rounded-2xl border border-forest-100 bg-white p-6 text-left transition-shadow hover:shadow-soft"
            >
              <div className="flex items-start justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-forest-50 text-forest-700">
                  <a.icon size={18} />
                </span>
                {isOpen ? <ChevronUp size={16} className="text-ink/40" /> : <ChevronDown size={16} className="text-ink/40" />}
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-forest-900">{a.title}</h3>
              <p className="mt-2 text-sm text-ink/65">{a.text}</p>
              {isOpen && (
                <p className="mt-3 border-t border-forest-100 pt-3 text-sm text-ink/60">{a.more}</p>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-16">
        <Quiz />
      </div>
    </div>
  );
}

function Quiz() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const done = step >= QUIZ.length;

  function choose(idx) {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === QUIZ[step].answer) setScore((s) => s + 1);
  }

  function next() {
    setSelected(null);
    setStep((s) => s + 1);
  }

  function restart() {
    setStep(0);
    setSelected(null);
    setScore(0);
  }

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-forest-100 bg-white p-7 shadow-soft sm:p-9">
      <p className="type-eyebrow text-sm">Quick quiz</p>
      <h2 className="mt-1 font-display text-2xl font-semibold text-forest-900">Test what you've learned</h2>

      {!done ? (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-forest-700">
            Question {step + 1} / {QUIZ.length}
          </p>
          <p className="mt-2 text-base font-medium text-ink">{QUIZ[step].q}</p>

          <div className="mt-4 space-y-2">
            {QUIZ[step].options.map((opt, idx) => {
              const isCorrect = idx === QUIZ[step].answer;
              const isSelected = selected === idx;
              let style = "border-forest-100 hover:border-forest-400";
              if (selected !== null) {
                if (isCorrect) style = "border-forest-500 bg-forest-50";
                else if (isSelected) style = "border-berry/50 bg-berry/5";
              }
              return (
                <button
                  key={opt}
                  onClick={() => choose(idx)}
                  disabled={selected !== null}
                  className={`focus-ring block w-full rounded-xl border px-4 py-3 text-left text-sm font-medium text-ink transition-colors ${style}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <button
              onClick={next}
              className="focus-ring mt-5 rounded-full bg-forest-700 px-5 py-2.5 text-sm font-semibold text-paper"
            >
              {step + 1 < QUIZ.length ? "Next question" : "See my score"}
            </button>
          )}
        </div>
      ) : (
        <div className="mt-6 text-center">
          <Trophy className="mx-auto text-forest-600" size={32} />
          <p className="mt-3 font-display text-3xl font-semibold text-forest-900">
            {score} / {QUIZ.length}
          </p>
          <p className="mt-1 text-sm text-ink/60">
            {score === QUIZ.length ? "Perfect score — you know your waste!" : "Nice try — a quick reread of the cards above can help."}
          </p>
          <button
            onClick={restart}
            className="focus-ring mt-5 inline-flex items-center gap-2 rounded-full border border-forest-200 px-5 py-2.5 text-sm font-semibold text-forest-900 hover:bg-forest-50"
          >
            <RotateCcw size={15} /> Try again
          </button>
        </div>
      )}
    </div>
  );
}