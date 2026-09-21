import "dotenv/config";
import express from "express";
import cors from "cors";
import { retrieve, getAllDocuments } from "./services/ragService.js";
import { callGroq, callGroqVision } from "./services/groqService.js";

// Never let an unexpected error silently kill the dev server — log it so
// the real cause is visible in the terminal instead of just a connection
// reset on the client side.
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
});
process.on("unhandledRejection", (err) => {
  console.error("[unhandledRejection]", err);
});

const app = express();
app.use(cors());
// Raised from the default 100kb so base64-encoded photos from the Identify
// page (resized client-side, but still larger than typical JSON) fit.
app.use(express.json({ limit: "8mb" }));

const CATEGORIES = [
  "Wet / Organic Waste",
  "Dry Waste",
  "Recyclable Waste",
  "E-Waste",
  "Hazardous Waste",
  "Glass Waste",
  "Metal Waste",
  "Textile Waste",
  "Sanitary Waste",
  "Other / Uncertain"
];

function buildContext(docs) {
  if (docs.length === 0) return "No matching documents were found in the knowledge base.";
  return docs
    .map(
      (d, i) =>
        `${i + 1}. Item: ${d.item} | Category: ${d.category} | Disposal: ${d.disposal} | Avoid: ${d.avoid} | Reuse: ${d.reuse} | Source: ${d.source}`
    )
    .join("\n");
}

/**
 * Some models wrap JSON responses in ```json ... ``` fences even when asked
 * not to, or when response_format isn't fully honored. Strip those before
 * parsing so a cosmetic formatting quirk doesn't surface as a 500 error.
 */
function safeParseJson(raw) {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned);
}

function confidenceLabel(score) {
  if (score >= 75) return { level: "high", label: "High confidence" };
  if (score >= 45) return { level: "medium", label: "Moderate confidence — please verify local disposal rules." };
  return { level: "low", label: "Low confidence — EcoSort could not confidently identify this item." };
}

/**
 * The shared RAG + classification core. Used by both /api/classify (typed
 * description) and /api/classify-image (photo, once Groq Vision has turned
 * it into a text label) so both input paths get identical grounding,
 * scoring, and explainability.
 *
 * isFollowUpRound: when true, this is a second call after the user answered
 * a clarifying question — the model is told not to ask another one and to
 * give a definitive, refined answer using the extra detail provided.
 */
async function classifyItem(itemLabel, { isFollowUpRound = false } = {}) {
  const docs = retrieve(itemLabel, 3);
  const context = buildContext(docs);

  const followUpInstruction = isFollowUpRound
    ? `This is a follow-up round — the user has already answered one clarifying question (see the extra detail in the item description below). Do NOT ask another follow-up question. Set "needsFollowUp" to false and give a definitive, refined recommendation that takes the extra detail into account.`
    : `If the item is a durable/reusable good (electronics, clothing, furniture) where the best action genuinely depends on a detail you don't know yet (e.g. whether it still works, whether it's damaged), you may ask exactly ONE short clarifying question by setting "needsFollowUp" to true. Only do this when it would meaningfully change the recommendation — most items (food scraps, packaging, obviously broken items) do NOT need a follow-up. Keep "followUpOptions" to 2-3 short button labels (e.g. ["Yes, it works", "No, it's broken", "Not sure"]).`;

  const systemPrompt = `You are EcoSort AI, a waste classification assistant. Classify the user's item into exactly one of these categories: ${CATEGORIES.join(
    ", "
  )}. Use the retrieved knowledge-base context below as your primary source of truth. If the item is unclear or not covered, use "Other / Uncertain" and lower confidence accordingly.

${followUpInstruction}

Knowledge base context:
${context}

Respond ONLY with a JSON object in this exact shape:
{
  "category": "<one of the categories>",
  "confidenceScore": <integer 0-100>,
  "why": "<one or two sentence explanation>",
  "disposal": "<recommended action>",
  "avoid": "<what to avoid>",
  "reuse": "<a sustainability / reuse tip, or null>",
  "sustainabilityScore": <integer 0-100>,
  "needsFollowUp": <true or false>,
  "followUpQuestion": "<short question, or null if needsFollowUp is false>",
  "followUpOptions": ["<option 1>", "<option 2>"]
}`;

  const raw = await callGroq(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Item: ${itemLabel}` }
    ],
    { jsonMode: true }
  );

  const parsed = safeParseJson(raw);
  const confidenceScore = Math.max(0, Math.min(100, Number(parsed.confidenceScore) || 50));
  const needsFollowUp = !isFollowUpRound && !!parsed.needsFollowUp && !!parsed.followUpQuestion;

  return {
    ok: true,
    item: itemLabel,
    category: parsed.category || "Other / Uncertain",
    confidenceScore,
    confidence: confidenceLabel(confidenceScore),
    why: parsed.why,
    disposal: parsed.disposal,
    avoid: parsed.avoid,
    reuse: parsed.reuse,
    sustainabilityScore: parsed.sustainabilityScore ?? null,
    needsFollowUp,
    followUpQuestion: needsFollowUp ? parsed.followUpQuestion : null,
    followUpOptions: needsFollowUp && Array.isArray(parsed.followUpOptions) ? parsed.followUpOptions.slice(0, 4) : null,
    sources: docs.map((d) => ({ id: d.id, title: d.source, item: d.item })),
    explainability: {
      classificationReason: `Groq (${process.env.GROQ_MODEL || "openai/gpt-oss-20b"}) classified this item using the retrieved knowledge-base context below.`,
      retrievedInfo: docs.length
        ? `Retrieved ${docs.length} related document(s): ${docs.map((d) => d.source).join(", ")}.`
        : "No closely matching documents were retrieved; the model reasoned from general knowledge.",
      recommendationLogic: isFollowUpRound
        ? "The recommendation was refined using the additional detail you provided, grounded in the retrieved documents (RAG)."
        : "The recommendation was generated by an LLM grounded in the retrieved documents (RAG)."
    }
  };
}

/**
 * POST /api/classify
 * body: { text: string, followUpQuestion?: string, followUpAnswer?: string }
 */
app.post("/api/classify", async (req, res) => {
  try {
    const { text, followUpQuestion, followUpAnswer } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ ok: false, error: "Please describe the item or upload an image before analyzing." });
    }

    const isFollowUpRound = !!followUpAnswer;
    const itemLabel = isFollowUpRound ? `${text} (${followUpQuestion || "additional detail"}: ${followUpAnswer})` : text;

    const result = await classifyItem(itemLabel, { isFollowUpRound });
    res.json({ ...result, item: isFollowUpRound ? text : result.item });
  } catch (err) {
    console.error("[/api/classify] failed:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * POST /api/classify-image
 * body: { imageBase64: string (no data: prefix), mimeType: string }
 */
app.post("/api/classify-image", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ ok: false, error: "No image was received." });
    }

    const visionPrompt =
      "Look at this photo and identify the single waste item shown, in 2-5 words " +
      "(e.g. 'plastic water bottle', 'banana peel', 'old mobile phone', 'used battery'). " +
      "Respond with ONLY the item name — no punctuation, no explanation, no extra words. " +
      "If you genuinely cannot tell what it is, respond with exactly: unclear item";

    const detectedLabel = (await callGroqVision(imageBase64, mimeType || "image/jpeg", visionPrompt))
      .trim()
      .replace(/^["'.]+|["'.]+$/g, "");

    if (!detectedLabel || /^unclear item$/i.test(detectedLabel)) {
      return res.json({
        ok: true,
        item: "Unclear item (photo)",
        category: "Other / Uncertain",
        confidenceScore: 15,
        confidence: confidenceLabel(15),
        why: "Groq's vision model looked at the photo but couldn't confidently identify a specific item.",
        disposal: "Try a clearer, closer, well-lit photo, or describe the item in words instead.",
        avoid: "Avoid guessing — try the text description option for a more reliable result.",
        reuse: null,
        sustainabilityScore: null,
        needsFollowUp: false,
        followUpQuestion: null,
        followUpOptions: null,
        sources: [],
        detectedLabel: null,
        viaImage: true,
        explainability: {
          classificationReason: "The vision model returned low confidence or an unclear result for this image.",
          retrievedInfo: "No text label was confidently extracted from the photo to retrieve against.",
          recommendationLogic: "A generic uncertainty response was returned in place of a specific recommendation."
        }
      });
    }

    const result = await classifyItem(detectedLabel);
    res.json({ ...result, item: detectedLabel, detectedLabel, viaImage: true });
  } catch (err) {
    console.error("[/api/classify-image] failed:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * POST /api/chat
 * body: { message: string, context?: string }
 */
app.post("/api/chat", async (req, res) => {
  try {
    const { message, context: userContext } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ ok: false, error: "Please enter a question." });
    }

    const docs = retrieve(message, 2);
    const context = buildContext(docs);

    const systemPrompt = `You are "Ask EcoSort", a friendly waste-disposal assistant. Answer the user's question in 2-4 short sentences, grounded in the knowledge-base context below when relevant. If nothing relevant is retrieved, answer generally but recommend checking local guidance.${
      userContext ? `\n\nConversation context: ${userContext}` : ""
    }

Knowledge base context:
${context}`;

    const answer = await callGroq([
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ]);

    res.json({
      ok: true,
      answer,
      sourceLabel: docs[0]?.source || null,
      retrieved: docs
    });
  } catch (err) {
    console.error("[/api/chat] failed:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * POST /api/rag-test
 * body: { query: string }
 * Pure retrieval, no Groq call — lets the Knowledge Base page demonstrate
 * the RAG retrieval step in isolation, and works even without an API key.
 */
app.post("/api/rag-test", (req, res) => {
  const { query } = req.body;
  if (!query || !query.trim()) {
    return res.status(400).json({ ok: false, error: "Please enter a query to test." });
  }
  const docs = retrieve(query, 5);
  res.json({ ok: true, query, results: docs });
});

app.get("/api/knowledge-base", (_req, res) => {
  res.json({ ok: true, documents: getAllDocuments() });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, groqConfigured: !!process.env.GROQ_API_KEY });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`EcoSort AI server running on http://localhost:${PORT}`);
  console.log(
    process.env.GROQ_API_KEY
      ? "Groq API key detected — AI is live."
      : "No Groq API key set — /api/classify, /api/classify-image, and /api/chat will return an error until GROQ_API_KEY is added to server/.env."
  );
});