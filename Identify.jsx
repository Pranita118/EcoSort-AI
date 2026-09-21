import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UploadCloud, X, Sparkles, ImageUp, Loader2, Eye, HelpCircle } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import SetupNotice from "../components/SetupNotice.jsx";
import { demoExamples } from "../data/demoExamples.js";
import { classifyWaste, classifyImage } from "../services/aiService.js";
import { fileToResizedBase64 } from "../services/imageUtils.js";
import { useApp } from "../services/AppContext.jsx";

export default function Identify() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { recordAnalysis, apiStatus } = useApp();
  const fileInputRef = useRef(null);

  const [text, setText] = useState(params.get("q") || "");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("Analyzing your waste...");
  const [error, setError] = useState("");

  // When the AI needs one clarifying detail before giving a final answer,
  // we hold the in-progress state here instead of navigating away — the
  // whole back-and-forth stays on this one page.
  const [followUp, setFollowUp] = useState(null); // { item, question, options }

  useEffect(() => {
    const q = params.get("q");
    if (q) setText(q);
    if (q && params.get("auto") === "1") {
      runAnalysis(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, or WEBP).");
      return;
    }
    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
  }

  function finish(result, usingImage) {
    recordAnalysis(result);
    setFollowUp(null);
    navigate("/results", { state: { result, viaImage: usingImage } });
  }

  async function runAnalysis(textOverride) {
    const usingImage = !textOverride && !!imageFile;

    if (!usingImage && !(textOverride ?? text)?.trim()) {
      setError("Please describe the item or upload an image first.");
      return;
    }

    setError("");
    setLoading(true);

    let result;
    if (usingImage) {
      setLoadingLabel("Looking at your photo...");
      try {
        const { base64, mimeType } = await fileToResizedBase64(imageFile);
        setLoadingLabel("Identifying and classifying...");
        result = await classifyImage(base64, mimeType);
      } catch (err) {
        setLoading(false);
        setError(err.message || "Could not process that image.");
        return;
      }
    } else {
      setLoadingLabel("Analyzing your waste...");
      result = await classifyWaste(textOverride ?? text);
    }

    setLoading(false);

    if (result.ok === false) {
      setError(result.error || "Something went wrong. Please try again.");
      return;
    }

    if (result.needsFollowUp) {
      setFollowUp({
        item: result.item,
        question: result.followUpQuestion,
        options: result.followUpOptions || []
      });
      return;
    }

    finish(result, usingImage);
  }

  async function answerFollowUp(answer) {
    if (!followUp) return;
    setLoading(true);
    setLoadingLabel("Refining the recommendation...");
    const result = await classifyWaste(followUp.item, { question: followUp.question, answer });
    setLoading(false);

    if (result.ok === false) {
      setError(result.error || "Something went wrong. Please try again.");
      setFollowUp(null);
      return;
    }
    finish(result, false);
  }

  const aiReady = apiStatus.checked && apiStatus.connected && apiStatus.groqConfigured;

  return (
    <div>
      <PageHeader
        eyebrow="Step 1 of 2"
        title="Identify your waste"
        subtitle="Upload a real photo or describe the item in your own words — both are analyzed live by Groq."
      />

      <div className="mx-auto max-w-4xl px-5 pb-20">
        <SetupNotice />

        {followUp ? (
          <FollowUpCard followUp={followUp} loading={loading} onAnswer={answerFollowUp} onCancel={() => setFollowUp(null)} />
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Upload */}
              <div>
                <p className="mb-2 text-sm font-semibold text-forest-900">Upload Image</p>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    handleFile(e.dataTransfer.files?.[0]);
                  }}
                  className={`relative flex h-56 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center transition-colors ${
                    dragActive ? "border-forest-500 bg-forest-50" : "border-forest-200 bg-white"
                  }`}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview of uploaded waste item" className="h-full w-full rounded-xl object-cover" />
                      <button
                        onClick={clearImage}
                        className="focus-ring absolute right-2 top-2 rounded-full bg-forest-900/80 p-1.5 text-paper"
                        aria-label="Remove image"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="text-forest-400" size={28} />
                      <p className="mt-2 text-sm font-medium text-ink/70">Drag & drop an image</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="focus-ring mt-3 rounded-full border border-forest-200 px-4 py-1.5 text-xs font-semibold text-forest-700 hover:bg-forest-50"
                      >
                        Browse files
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFile(e.target.files?.[0])}
                      />
                    </>
                  )}
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-ink/45">
                  <Eye size={12} /> Real photo analysis via Groq Vision (qwen3.6-27b) — it genuinely looks at the image.
                </p>
              </div>

              {/* Text */}
              <div>
                <p className="mb-2 text-sm font-semibold text-forest-900">Describe Waste</p>
                <label htmlFor="waste-desc" className="sr-only">
                  What waste item do you want to identify?
                </label>
                <textarea
                  id="waste-desc"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. old mobile phone, banana peel, plastic bottle..."
                  className="focus-ring h-56 w-full resize-none rounded-2xl border border-forest-100 bg-white p-4 text-sm text-ink placeholder:text-ink/35"
                />
              </div>
            </div>

            {imageFile && (
              <p className="mt-4 text-center text-xs font-medium text-forest-700">
                An image is attached — "Analyze with AI" will identify it from the photo itself.
              </p>
            )}

            {error && <p className="mt-4 text-center text-sm font-medium text-berry">{error}</p>}

            <div className="mt-6 flex flex-col items-center gap-4">
              <button
                onClick={() => runAnalysis()}
                disabled={loading}
                className={`focus-ring inline-flex items-center gap-2 rounded-full bg-forest-700 px-8 py-3.5 text-sm font-semibold text-paper shadow-soft transition-transform hover:-translate-y-0.5 disabled:opacity-90 ${
                  loading ? "animate-pulse-ring" : ""
                }`}
              >
                {loading ? <Loader2 size={16} className="animate-spin-slow" /> : <Sparkles size={16} />}
                {loading ? loadingLabel : "Analyze with AI"}
              </button>
              <p className="text-xs font-medium text-ink/40">
                {aiReady ? "Powered live by Groq" : "Waiting for the AI server to connect..."}
              </p>
            </div>

            <div className="mt-12">
              <p className="text-center text-sm font-semibold text-ink/60">Try these examples</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {demoExamples.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => {
                      clearImage();
                      setText(ex.query);
                      runAnalysis(ex.query);
                    }}
                    className="focus-ring rounded-full border border-forest-100 bg-white px-4 py-2 text-sm font-medium text-ink/75 transition-colors hover:border-forest-400 hover:text-forest-700"
                  >
                    {ex.icon} {ex.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FollowUpCard({ followUp, loading, onAnswer, onCancel }) {
  const [customAnswer, setCustomAnswer] = useState("");

  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-forest-100 bg-white p-7 text-center shadow-soft sm:p-9">
      <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-forest-50 text-forest-700">
        <HelpCircle size={20} />
      </span>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-forest-700">One quick question</p>
      <h2 className="mt-1 font-display text-xl font-semibold text-forest-900">{followUp.question}</h2>
      <p className="mt-1 text-sm text-ink/50">about your {followUp.item}</p>

      {loading ? (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-ink/50">
          <Loader2 size={16} className="animate-spin-slow" /> Refining the recommendation...
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-col gap-2">
            {followUp.options.map((opt) => (
              <button
                key={opt}
                onClick={() => onAnswer(opt)}
                className="focus-ring rounded-xl border border-forest-200 px-4 py-3 text-sm font-medium text-forest-900 transition-colors hover:border-forest-500 hover:bg-forest-50"
              >
                {opt}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customAnswer.trim()) onAnswer(customAnswer.trim());
            }}
            className="mt-4 flex gap-2"
          >
            <input
              value={customAnswer}
              onChange={(e) => setCustomAnswer(e.target.value)}
              placeholder="Or type your own answer..."
              className="focus-ring w-full rounded-full border border-forest-100 px-4 py-2 text-sm"
            />
            <button type="submit" className="focus-ring rounded-full bg-forest-700 px-4 py-2 text-sm font-semibold text-paper">
              Go
            </button>
          </form>

          <button onClick={onCancel} className="focus-ring mt-4 text-xs font-medium text-ink/40 hover:text-ink/60">
            Cancel and start over
          </button>
        </>
      )}
    </div>
  );
}