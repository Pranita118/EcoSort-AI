import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Recycle,
  TriangleAlert,
  Leaf,
  ChevronDown,
  ChevronUp,
  BookOpenCheck,
  MessageCircle,
  RotateCcw,
  Sparkles,
  Camera,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  ClipboardList
} from "lucide-react";
import WasteChip from "../components/WasteChip.jsx";
import ConfidenceMeter from "../components/ConfidenceMeter.jsx";
import CompareOptions from "../components/CompareOptions.jsx";
import { useApp } from "../services/AppContext.jsx";
import { WASTE_CATEGORIES } from "../services/classificationService.js";

const SPECIAL_HANDLING_CATEGORIES = ["E-Waste", "Hazardous Waste", "Sanitary Waste", "Glass Waste"];

const ACTION_CHOICES = [
  { label: "Reuse / Repair", emoji: "🔧" },
  { label: "Donate", emoji: "🤝" },
  { label: "Recycle", emoji: "♻️" },
  { label: "Keep for later", emoji: "📦" },
  { label: "Disposed", emoji: "🗑️" }
];

export default function Results() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { addAction, submitFeedback } = useApp();
  const [showSources, setShowSources] = useState(false);
  const [savedAction, setSavedAction] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState(null); // "up" | "down" | null
  const [correcting, setCorrecting] = useState(false);
  const [correctedCategory, setCorrectedCategory] = useState("");
  const result = state?.result;

  if (!result) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-forest-900">No result to show yet</h1>
        <p className="mt-3 text-ink/60">Analyze an item first to see its AI classification result here.</p>
        <Link
          to="/identify"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest-700 px-6 py-3 text-sm font-semibold text-paper"
        >
          Identify a waste item
        </Link>
      </div>
    );
  }

  const scoreLabel =
    result.sustainabilityScore == null
      ? null
      : result.sustainabilityScore >= 70
      ? "Good disposal choice"
      : result.sustainabilityScore >= 45
      ? "Fair disposal choice — room to improve"
      : "Handle with extra care";

  function chooseAction(label) {
    const entry = addAction(result, label);
    setSavedAction(entry);
  }

  function giveFeedback(isCorrect) {
    if (isCorrect) {
      submitFeedback({ item: result.item, originalCategory: result.category, isCorrect: true });
      setFeedbackGiven("up");
    } else {
      setCorrecting(true);
    }
  }

  function submitCorrection() {
    submitFeedback({
      item: result.item,
      originalCategory: result.category,
      isCorrect: false,
      correctedCategory
    });
    setFeedbackGiven("down");
    setCorrecting(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <p className="type-eyebrow text-center text-sm">AI Analysis Result</p>
      <h1 className="mt-2 text-center font-display text-3xl font-semibold capitalize text-forest-900">
        {result.item}
      </h1>

      <div className="mt-8 rounded-3xl border border-forest-100 bg-white p-7 shadow-soft sm:p-9">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <WasteChip category={result.category} size="lg" />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-forest-400/30 bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-700">
            {result.viaImage ? <Camera size={12} /> : <Sparkles size={12} />}
            {result.viaImage ? "Identified from your photo via Groq Vision" : "Live analysis via Groq"}
          </span>
        </div>

        <div className="mt-6">
          <ConfidenceMeter
            score={result.confidenceScore}
            level={result.confidence.level}
            label={result.confidence.label}
          />
        </div>

        <Divider />

        <Block icon={<Leaf size={16} />} title="Why?" text={result.why} />
        <Block icon={<Recycle size={16} />} title="Recommended Action" text={result.disposal} tone="good" />
        <Block icon={<TriangleAlert size={16} />} title="Avoid" text={result.avoid} tone="warn" />
        {result.reuse && <Block icon={<Leaf size={16} />} title="Sustainability Tip" text={result.reuse} tone="good" />}

        {scoreLabel && (
          <div className="mt-6 flex items-center justify-between rounded-2xl bg-forest-50 px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-forest-700">Sustainability Score</p>
              <p className="text-xs text-ink/50">Educational indicator, not an official measurement</p>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-semibold text-forest-900">{result.sustainabilityScore}/100</p>
              <p className="text-xs text-forest-700">{scoreLabel}</p>
            </div>
          </div>
        )}

        {/* Source transparency + pipeline */}
        <div className="mt-6 border-t border-forest-100 pt-5">
          <button
            onClick={() => setShowSources((v) => !v)}
            className="focus-ring flex w-full items-center justify-between text-left"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-forest-900">
              <BookOpenCheck size={16} /> Why did EcoSort recommend this?
            </span>
            {showSources ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showSources && result.explainability && (
            <div className="mt-4 space-y-4 rounded-2xl bg-paper p-4 text-sm text-ink/70">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {["Input", "Classification", "Confidence", "Knowledge Retrieval", "Recommendation"].map((stage, i, arr) => (
                  <React.Fragment key={stage}>
                    <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-forest-700">{stage}</span>
                    {i < arr.length - 1 && <span className="text-ink/30">→</span>}
                  </React.Fragment>
                ))}
              </div>

              <p><span className="font-semibold text-ink">Classification reason: </span>{result.explainability.classificationReason}</p>
              <p><span className="font-semibold text-ink">Retrieved information: </span>{result.explainability.retrievedInfo}</p>
              <p><span className="font-semibold text-ink">Recommendation logic: </span>{result.explainability.recommendationLogic}</p>

              {result.sources?.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-forest-700">Knowledge Used</p>
                  <ul className="mt-2 space-y-1">
                    {result.sources.map((s, i) => (
                      <li key={s.id || i} className="rounded-lg bg-white px-3 py-2 text-xs text-ink/70">
                        {i + 1}. {s.title} — <span className="italic">{s.item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Feedback / correction loop */}
        <div className="mt-5 flex items-center justify-between rounded-2xl bg-paper px-4 py-3">
          {feedbackGiven ? (
            <p className="flex items-center gap-2 text-sm font-medium text-forest-700">
              <CheckCircle2 size={15} /> {feedbackGiven === "up" ? "Thanks for confirming!" : "Thanks — correction recorded."}
            </p>
          ) : correcting ? (
            <div className="flex w-full flex-wrap items-center gap-2">
              <select
                value={correctedCategory}
                onChange={(e) => setCorrectedCategory(e.target.value)}
                className="focus-ring rounded-lg border border-forest-100 px-2 py-1.5 text-xs"
              >
                <option value="">What should it be?</option>
                {WASTE_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <button
                onClick={submitCorrection}
                disabled={!correctedCategory}
                className="focus-ring rounded-lg bg-forest-700 px-3 py-1.5 text-xs font-semibold text-paper disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-ink/60">Was this classification correct?</p>
              <div className="flex gap-2">
                <button onClick={() => giveFeedback(true)} className="focus-ring rounded-full p-2 text-forest-600 hover:bg-forest-50" aria-label="Correct">
                  <ThumbsUp size={16} />
                </button>
                <button onClick={() => giveFeedback(false)} className="focus-ring rounded-full p-2 text-berry hover:bg-berry/10" aria-label="Incorrect">
                  <ThumbsDown size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <CompareOptions category={result.category} />

      {/* Action selection */}
      <div className="mt-8 rounded-3xl border border-forest-100 bg-white p-6 text-center">
        {savedAction ? (
          <>
            <CheckCircle2 className="mx-auto text-forest-600" size={24} />
            <p className="mt-2 font-display text-lg font-semibold text-forest-900">Action recorded: {savedAction.selectedAction}</p>
            <Link to="/my-actions" className="focus-ring mt-3 inline-flex items-center gap-2 text-sm font-semibold text-forest-700 hover:underline">
              <ClipboardList size={15} /> View in My Actions
            </Link>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-forest-900">What do you want to do?</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {ACTION_CHOICES.map((a) => (
                <button
                  key={a.label}
                  onClick={() => chooseAction(a.label)}
                  className="focus-ring rounded-full border border-forest-200 px-4 py-2 text-sm font-medium text-forest-900 hover:bg-forest-50"
                >
                  {a.emoji} {a.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {SPECIAL_HANDLING_CATEGORIES.includes(result.category) && (
          <a
            href={`https://www.google.com/maps/search/${encodeURIComponent(result.category + " drop off center near me")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-forest-200 px-5 py-3 text-sm font-semibold text-forest-900 hover:bg-forest-50"
          >
            <MapPin size={15} /> Find a drop-off center near me
          </a>
        )}
        <button
          onClick={() => navigate("/identify")}
          className="focus-ring inline-flex items-center gap-2 rounded-full border border-forest-200 px-5 py-3 text-sm font-semibold text-forest-900 hover:bg-forest-50"
        >
          <RotateCcw size={15} /> Analyze Another Item
        </button>
        <Link
          to="/ask-ai"
          state={{ item: result.item, category: result.category }}
          className="focus-ring inline-flex items-center gap-2 rounded-full bg-forest-700 px-5 py-3 text-sm font-semibold text-paper"
        >
          <MessageCircle size={15} /> Ask EcoSort AI
        </Link>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="my-6 h-px bg-forest-100" />;
}

function Block({ icon, title, text, tone }) {
  const toneColor = tone === "good" ? "text-forest-700" : tone === "warn" ? "text-clay" : "text-ink";
  return (
    <div className="mt-5 first:mt-0">
      <p className={`flex items-center gap-2 text-sm font-semibold ${toneColor}`}>
        {icon} {title}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{text}</p>
    </div>
  );
}