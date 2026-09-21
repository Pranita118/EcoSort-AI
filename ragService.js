import { knowledgeBase } from "../data/knowledgeBase.js";

/**
 * Generic descriptive words that appear across many knowledge-base entries
 * ("old phone", "old clothes", "used battery"...). Left in the scorer they
 * spuriously inflate unrelated documents just because a query says "old" or
 * "used". They're stripped before scoring so the *distinctive* words in a
 * query (the material or item name) drive the match instead.
 */
const STOPWORDS = new Set([
  "old", "used", "new", "broken", "damaged", "empty", "small", "big",
  "my", "a", "an", "the", "this", "that", "some", "is", "are", "of",
  "it", "and", "or", "with", "for"
]);

/**
 * Normalizes free text for comparison.
 */
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function meaningfulTokens(phrase) {
  return phrase.split(" ").filter((t) => t && !STOPWORDS.has(t));
}

/**
 * Cheap Levenshtein edit distance, capped for performance, used to catch
 * typos and near-misses (e.g. "botle" -> "bottle").
 */
function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 3) return 99; // fast reject, not worth scoring
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      let cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let val = Math.min(dp[i - 1][j - 1] + cost, dp[i - 1][j] + 1, dp[i][j - 1] + 1);
      // Treat adjacent-letter transpositions ("mobiel" vs "mobile") as a
      // single edit, matching how people actually mistype words.
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        val = Math.min(val, dp[i - 2][j - 2] + 1);
      }
      dp[i][j] = val;
    }
  }
  return dp[a.length][b.length];
}

function tokenFuzzyMatch(a, b) {
  if (a === b) return 3;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen >= 4) {
    const tolerance = maxLen >= 7 ? 2 : 1;
    if (editDistance(a, b) <= tolerance) return 2.4;
  }
  if (a.length >= 3 && b.length >= 3 && (a.startsWith(b) || b.startsWith(a))) return 1.6;
  return 0;
}

/**
 * Scores a single knowledge base document against a query using fuzzy
 * token/phrase overlap on meaningful (non-stopword) tokens. This stands in
 * for a vector similarity search in the full RAG pipeline (see README for
 * how to swap in a real embeddings store), but is tolerant of typos,
 * plurals, and partial phrasing so classification feels responsive to
 * whatever the user actually types.
 */
function scoreDocument(query, doc) {
  const q = normalize(query);
  const qTokens = meaningfulTokens(q);
  if (qTokens.length === 0) return 0;
  let score = 0;

  const haystacks = [doc.item, ...(doc.keywords || [])].map(normalize);

  haystacks.forEach((phrase) => {
    if (!phrase) return;
    if (q === phrase) score += 14;
    else if (qTokens.length > 1 && (q.includes(phrase) || phrase.includes(q))) score += 9;

    const phraseTokens = meaningfulTokens(phrase);
    phraseTokens.forEach((pt) => {
      let best = 0;
      qTokens.forEach((qt) => {
        best = Math.max(best, tokenFuzzyMatch(qt, pt));
      });
      score += best;
    });
  });

  return score;
}

/**
 * Retrieves the top-N most relevant knowledge base documents for a query.
 * This is the "RETRIEVE RELEVANT DOCUMENTS" + "RANK RELEVANT INFORMATION"
 * step of the RAG workflow.
 */
export function retrieve(query, topN = 3) {
  if (!query || !query.trim()) return [];

  const ranked = knowledgeBase
    .map((doc) => ({ doc, score: scoreDocument(query, doc) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return ranked.slice(0, topN).map((r) => ({ ...r.doc, matchScore: r.score }));
}

export function getAllDocuments() {
  return knowledgeBase;
}

export function getDocumentById(id) {
  return knowledgeBase.find((d) => d.id === id) || null;
}
