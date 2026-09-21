/**
 * aiService is the single place the rest of the app talks to for AI
 * behaviour. Every call goes to the Express backend (server/server.js),
 * which retrieves context from the local knowledge base (RAG) and asks
 * Groq to generate a grounded response.
 *
 * There is no offline/demo fallback: if the server isn't running or the
 * Groq API key isn't configured, calls fail with a clear, actionable
 * error message instead of silently returning fake data.
 */

const API_BASE = "/api";

function friendlyError(message) {
  if (/GROQ_API_KEY/i.test(message)) {
    return "EcoSort AI isn't connected yet. Add your Groq API key to server/.env (GROQ_API_KEY=...) and restart the server.";
  }
  if (/Failed to fetch|NetworkError|ECONNREFUSED|fetch failed/i.test(message)) {
    return "Can't reach the EcoSort AI server. Make sure it's running — from the project root, run: npm run dev";
  }
  return `EcoSort AI ran into an issue: ${message}`;
}

async function callBackend(path, body) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } catch (err) {
    throw new Error(friendlyError(err.message || "network error"));
  }

  const data = await res.json().catch(() => null);

  if (!res.ok || !data || data.ok === false) {
    throw new Error(friendlyError(data?.error || `Request failed (${res.status})`));
  }

  return data;
}

/**
 * Classifies a waste item description via the live Groq-backed API.
 * followUp (optional): { question, answer } — pass this on the second call
 * after the user answered a clarifying question from the first result.
 */
export async function classifyWaste(input, followUp = null) {
  try {
    const body = { text: input };
    if (followUp?.answer) {
      body.followUpQuestion = followUp.question;
      body.followUpAnswer = followUp.answer;
    }
    const data = await callBackend("/classify", body);
    return { ...data, ok: true, source: "groq" };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Classifies a photographed waste item via Groq's real vision model.
 * base64/mimeType come from imageUtils.fileToResizedBase64.
 */
export async function classifyImage(base64, mimeType) {
  try {
    const data = await callBackend("/classify-image", { imageBase64: base64, mimeType });
    return { ...data, ok: true, source: "groq-vision" };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Answers a free-form "Ask EcoSort" chat question via the live Groq-backed API.
 * context (optional): a short string like "The user just analyzed an old
 * laptop, classified as E-Waste" so the assistant can be conversationally
 * aware of what was just identified.
 */
export async function askEcoSort(question, context = null) {
  try {
    const data = await callBackend("/chat", { message: question, context });
    return { ...data, ok: true, source: "groq" };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Pure RAG retrieval test — no LLM call, works even without a Groq key.
 * Powers the "Test RAG" tool on the Knowledge Base page.
 */
export async function testRag(query) {
  try {
    const data = await callBackend("/rag-test", { query });
    return { ...data, ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}