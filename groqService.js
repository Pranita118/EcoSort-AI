const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Shared low-level call to Groq's OpenAI-compatible chat completions
 * endpoint. Both text (callGroq) and vision (callGroqVision) requests go
 * through this so error handling stays identical for both.
 */
async function postChatCompletion(body) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured on the server.");
  }

  let res;
  try {
    res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });
  } catch (networkErr) {
    // DNS failure, no internet, Groq unreachable, etc.
    throw new Error(`Could not reach Groq (network error): ${networkErr.message}`);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let detail = text;
    try {
      const parsed = JSON.parse(text);
      detail = parsed.error?.message || text;
    } catch {
      // response wasn't JSON, use raw text as-is
    }
    throw new Error(`Groq API error (${res.status}): ${detail}`.slice(0, 500));
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  const finishReason = data.choices?.[0]?.finish_reason;

  if (!content || !content.trim()) {
    throw new Error(
      `Groq returned an empty response (finish_reason: ${finishReason || "unknown"}). This can happen if the model refused the request or hit a content filter — try rephrasing.`
    );
  }

  return content;
}

/**
 * Text-only chat completion. Throws a clear, specific error on any failure
 * (missing key, bad model, rate limit, empty response, etc.) — the route
 * handlers in server.js log these to the terminal and relay a friendly
 * version to the client.
 */
export async function callGroq(messages, { jsonMode = false } = {}) {
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
  return postChatCompletion({
    model,
    messages,
    temperature: 0.3,
    max_tokens: 700,
    ...(jsonMode ? { response_format: { type: "json_object" } } : {})
  });
}

/**
 * Real multimodal image analysis via Groq's vision-capable model. The image
 * is sent as a base64 data URL — no separate image hosting needed. This is
 * what powers the Identify page's photo upload: the model genuinely looks
 * at the picture rather than guessing from a filename.
 */
export async function callGroqVision(imageBase64, mimeType, prompt) {
  // GROQ_VISION_MODEL may be a comma-separated list, tried in order. If a
  // model 404s (retired, or not enabled for this Groq org/project) we move
  // on to the next one instead of failing the whole request.
  const candidates = (process.env.GROQ_VISION_MODEL || "qwen/qwen3.6-27b,qwen/qwen3.8-27b")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);

  const buildBody = (model, withReasoningOff) => ({
    model,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } }
        ]
      }
    ],
    temperature: 0.2,
    // Qwen models can "think" before answering; thinking tokens count toward
    // max_tokens, so 60 could be used up before any answer appears.
    max_tokens: 300,
    ...(withReasoningOff ? { reasoning_effort: "none", reasoning_format: "hidden" } : {})
  });

  let lastErr;
  for (const model of candidates) {
    try {
      try {
        return await postChatCompletion(buildBody(model, true));
      } catch (err) {
        // Model doesn't accept the reasoning params -> retry once without them.
        if (/\((400|422)\)/.test(err.message) && /reasoning/i.test(err.message)) {
          return await postChatCompletion(buildBody(model, false));
        }
        throw err;
      }
    } catch (err) {
      lastErr = err;
      if (/\(404\)/.test(err.message)) {
        console.warn(`[groq] vision model "${model}" unavailable (404), trying next...`);
        continue;
      }
      throw err;
    }
  }
  throw new Error(
    `None of the configured vision models are available to this Groq account (${candidates.join(", ")}). ` +
      `Check Model Permissions at https://console.groq.com/settings/project/limits, or set GROQ_VISION_MODEL in server/.env. ` +
      `Last error: ${lastErr?.message}`
  );
}