import React, { useState } from "react";
import { Link } from "react-router-dom";
import { RotateCcw, Wrench, Heart, Recycle, ShieldAlert, CheckCircle2, ClipboardCheck } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { useApp } from "../services/AppContext.jsx";

const QUESTIONS = [
  { key: "item", label: "What is the item?", type: "text", placeholder: "e.g. old laptop" },
  { key: "usable", label: "Is it still usable?", type: "bool" },
  { key: "damaged", label: "Is it damaged?", type: "bool" },
  { key: "electronic", label: "Does it contain electronics or a battery?", type: "bool" },
  { key: "contaminated", label: "Is it contaminated (food, chemicals, etc.)?", type: "bool" }
];

function decide(answers) {
  if (answers.contaminated) {
    return {
      path: ["Special Disposal"],
      result: "Special Disposal",
      reason: "Contaminated items can spoil an entire batch of recyclables and need isolated disposal.",
      icon: ShieldAlert
    };
  }
  if (answers.electronic) {
    if (answers.usable && !answers.damaged) {
      return {
        path: ["Reuse", "Repair", "Donate"],
        result: "Reuse / Repair / Donate",
        reason: "A working electronic item still has life left in it — reuse or donation avoids e-waste altogether.",
        icon: Heart
      };
    }
    return {
      path: ["E-Waste Recycling"],
      result: "E-Waste Recycling",
      reason: "Non-working or damaged electronics need certified e-waste recycling, not the regular bin.",
      icon: ShieldAlert
    };
  }
  if (answers.usable && !answers.damaged) {
    return {
      path: ["Reuse", "Donate"],
      result: "Reuse / Donate",
      reason: "If it still works and isn't damaged, reuse or donation is the most sustainable option.",
      icon: Heart
    };
  }
  if (answers.damaged) {
    return {
      path: ["Repair", "Recycle"],
      result: "Repair, or Recycle if unrepairable",
      reason: "A damaged but non-electronic item may be worth repairing; otherwise recycle the materials.",
      icon: Wrench
    };
  }
  return {
    path: ["Recycle"],
    result: "Recycle",
    reason: "This item is best sent through your standard recycling stream.",
    icon: Recycle
  };
}

export default function DecisionSupport() {
  const { addAction } = useApp();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saved, setSaved] = useState(false);
  const done = step >= QUESTIONS.length;

  function answer(key, value) {
    setAnswers((a) => ({ ...a, [key]: value }));
    setStep((s) => s + 1);
  }

  function reset() {
    setAnswers({});
    setStep(0);
    setSaved(false);
  }

  const outcome = done ? decide(answers) : null;

  function saveDecision() {
    addAction(
      {
        item: answers.item || "item",
        category: outcome.result,
        disposal: outcome.reason,
        avoid: ""
      },
      outcome.path[0]
    );
    setSaved(true);
  }

  return (
    <div className="mx-auto max-w-2xl px-5 pb-20">
      <PageHeader
        eyebrow="Decision support"
        title="Smart Disposal Decision"
        subtitle="Answer a few quick questions and EcoSort will walk the decision tree with you: Reuse → Repair → Donate → Recycle → Special Disposal."
      />

      <div className="rounded-3xl border border-forest-100 bg-white p-7 shadow-soft sm:p-9">
        {!done ? (
          <QuestionCard
            question={QUESTIONS[step]}
            onAnswer={answer}
            progress={`${step + 1} / ${QUESTIONS.length}`}
          />
        ) : (
          <div className="text-center">
            <outcome.icon className="mx-auto text-forest-600" size={34} />
            <h2 className="mt-3 font-display text-2xl font-semibold text-forest-900">{outcome.result}</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink/65">{outcome.reason}</p>

            <div className="mx-auto mt-6 flex max-w-md flex-wrap items-center justify-center gap-2">
              {outcome.path.map((p, i) => (
                <React.Fragment key={p}>
                  <span className="rounded-full bg-forest-50 px-3 py-1.5 text-xs font-semibold text-forest-700">
                    {p}
                  </span>
                  {i < outcome.path.length - 1 && <span className="text-ink/30">→</span>}
                </React.Fragment>
              ))}
            </div>

            <button
              onClick={reset}
              className="focus-ring mt-8 inline-flex items-center gap-2 rounded-full border border-forest-200 px-5 py-2.5 text-sm font-semibold text-forest-900 hover:bg-forest-50"
            >
              <RotateCcw size={15} /> Start over
            </button>

            {saved ? (
              <p className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-forest-700">
                <CheckCircle2 size={15} /> Saved —{" "}
                <Link to="/my-actions" className="underline">
                  view in My Actions
                </Link>
              </p>
            ) : (
              <button
                onClick={saveDecision}
                className="focus-ring mt-4 flex items-center gap-2 rounded-full bg-forest-700 px-5 py-2.5 text-sm font-semibold text-paper mx-auto"
              >
                <ClipboardCheck size={15} /> Save this decision to My Actions
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionCard({ question, onAnswer, progress }) {
  const [text, setText] = useState("");

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-forest-700">{progress}</p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-forest-900">{question.label}</h2>

      {question.type === "text" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onAnswer(question.key, text || "item");
          }}
          className="mt-5 flex gap-2"
        >
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={question.placeholder}
            className="focus-ring w-full rounded-full border border-forest-100 px-4 py-2.5 text-sm"
          />
          <button type="submit" className="focus-ring rounded-full bg-forest-700 px-5 py-2.5 text-sm font-semibold text-paper">
            Next
          </button>
        </form>
      ) : (
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => onAnswer(question.key, true)}
            className="focus-ring flex flex-1 items-center justify-center gap-2 rounded-2xl border border-forest-200 py-4 text-sm font-semibold text-forest-900 hover:bg-forest-50"
          >
            <CheckCircle2 size={16} /> Yes
          </button>
          <button
            onClick={() => onAnswer(question.key, false)}
            className="focus-ring flex flex-1 items-center justify-center gap-2 rounded-2xl border border-forest-200 py-4 text-sm font-semibold text-forest-900 hover:bg-forest-50"
          >
            No
          </button>
        </div>
      )}
    </div>
  );
}