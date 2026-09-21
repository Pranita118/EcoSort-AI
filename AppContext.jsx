import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AppContext = createContext(null);

const STORAGE_KEYS = {
  impact: "ecosort:impact",
  history: "ecosort:history",
  actions: "ecosort:actions",
  feedback: "ecosort:feedback"
};

const SEED_IMPACT = {
  itemsAnalyzed: 0,
  recyclable: 0,
  eWaste: 0,
  reuseOpportunities: 0,
  wasteDiversionKg: 0
};

// Short recommended-action label per category, used to seed "My Actions"
// so there's always a sensible default even before the user picks one.
const RECOMMENDED_ACTION_BY_CATEGORY = {
  "Wet / Organic Waste": "Compost",
  "Dry Waste": "Recycle",
  "Recyclable Waste": "Recycle",
  "E-Waste": "Reuse / Donate first",
  "Hazardous Waste": "Special Disposal",
  "Glass Waste": "Recycle",
  "Metal Waste": "Recycle",
  "Textile Waste": "Donate / Reuse",
  "Sanitary Waste": "Special Disposal",
  "Other / Uncertain": "Verify locally"
};

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage unavailable (private browsing, quota, etc.) — fail silently,
    // the app still works, it just won't persist across refreshes.
  }
}

async function checkHealth() {
  try {
    const res = await fetch("/api/health");
    if (!res.ok) return { connected: false, groqConfigured: false };
    const data = await res.json();
    return { connected: true, groqConfigured: !!data.groqConfigured };
  } catch {
    return { connected: false, groqConfigured: false };
  }
}

export function AppProvider({ children }) {
  const [impact, setImpact] = useState(() => loadFromStorage(STORAGE_KEYS.impact, SEED_IMPACT));
  const [history, setHistory] = useState(() => loadFromStorage(STORAGE_KEYS.history, []));
  const [actions, setActions] = useState(() => loadFromStorage(STORAGE_KEYS.actions, []));
  const [feedback, setFeedback] = useState(() => loadFromStorage(STORAGE_KEYS.feedback, []));
  const [lastResult, setLastResult] = useState(null);
  const [apiStatus, setApiStatus] = useState({ checked: false, connected: false, groqConfigured: false });

  useEffect(() => saveToStorage(STORAGE_KEYS.impact, impact), [impact]);
  useEffect(() => saveToStorage(STORAGE_KEYS.history, history), [history]);
  useEffect(() => saveToStorage(STORAGE_KEYS.actions, actions), [actions]);
  useEffect(() => saveToStorage(STORAGE_KEYS.feedback, feedback), [feedback]);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      const status = await checkHealth();
      if (!cancelled) setApiStatus({ checked: true, ...status });
    }
    poll();
    const interval = setInterval(poll, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  /**
   * Records a completed analysis. The full result is kept (not just a
   * summary) so "Recent Decisions" on Home can reopen the exact result,
   * and so feedback/actions can reference it later.
   */
  function recordAnalysis(result) {
    if (!result || !result.ok) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const entry = {
      id,
      category: result.category,
      confidence: result.confidenceScore,
      item: result.item,
      timestamp: Date.now(),
      result
    };
    setLastResult({ ...result, id });
    setHistory((h) => [entry, ...h].slice(0, 200));
    setImpact((prev) => ({
      itemsAnalyzed: prev.itemsAnalyzed + 1,
      recyclable:
        prev.recyclable + (["Recyclable Waste", "Dry Waste", "Glass Waste", "Metal Waste"].includes(result.category) ? 1 : 0),
      eWaste: prev.eWaste + (result.category === "E-Waste" ? 1 : 0),
      reuseOpportunities: prev.reuseOpportunities + (result.reuse ? 1 : 0),
      wasteDiversionKg: +(prev.wasteDiversionKg + (result.category !== "Other / Uncertain" ? 0.4 : 0)).toFixed(1)
    }));
    return id;
  }

  function resetImpact() {
    setImpact(SEED_IMPACT);
    setHistory([]);
  }

  /**
   * Adds an item to "My Actions". selectedAction is optional — if the user
   * picked one of the "What do you want to do?" buttons on Results, pass it;
   * otherwise it defaults to the category's recommended action and can be
   * changed later from the My Actions page.
   */
  function addAction(result, selectedAction = null) {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      item: result.item,
      category: result.category,
      disposal: result.disposal,
      avoid: result.avoid,
      recommendedAction: RECOMMENDED_ACTION_BY_CATEGORY[result.category] || "Verify locally",
      selectedAction: selectedAction || RECOMMENDED_ACTION_BY_CATEGORY[result.category] || null,
      status: "pending",
      note: "",
      addedAt: Date.now(),
      completedAt: null
    };
    setActions((list) => [entry, ...list]);
    return entry;
  }

  function setActionChoice(id, selectedAction) {
    setActions((list) => list.map((a) => (a.id === id ? { ...a, selectedAction } : a)));
  }

  function completeAction(id) {
    setActions((list) =>
      list.map((a) => (a.id === id ? { ...a, status: a.status === "completed" ? "pending" : "completed", completedAt: a.status === "completed" ? null : Date.now() } : a))
    );
  }

  function removeAction(id) {
    setActions((list) => list.filter((a) => a.id !== id));
  }

  /**
   * Records a thumbs up/down (and optional correction) on a classification.
   * This is the human-in-the-loop signal referenced on the Responsible AI
   * page — stored locally, shown back on Analytics as an AI-quality signal.
   */
  function submitFeedback({ analysisId, item, originalCategory, isCorrect, correctedCategory, note }) {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      analysisId,
      item,
      originalCategory,
      isCorrect,
      correctedCategory: correctedCategory || null,
      note: note || "",
      timestamp: Date.now()
    };
    setFeedback((list) => [entry, ...list]);
    return entry;
  }

  const value = useMemo(
    () => ({
      impact,
      history,
      actions,
      feedback,
      lastResult,
      apiStatus,
      recordAnalysis,
      resetImpact,
      addAction,
      setActionChoice,
      completeAction,
      removeAction,
      submitFeedback
    }),
    [impact, history, actions, feedback, lastResult, apiStatus]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}