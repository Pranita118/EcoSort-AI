import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";

const PIPELINE = ["User Input", "AI Understanding", "Waste Classification", "Knowledge Retrieval", "Recommendation Generation", "Explainable Result"];
const TECH = ["Groq LLM API (Llama 3 / GPT-OSS)", "Retrieval-Augmented Generation (RAG)", "Prompt Engineering", "Multimodal Input (prototype)", "Conversational AI"];

const SECTIONS = [
  {
    id: "mission",
    title: "Our Mission",
    body: <p>To make responsible waste segregation simple, accessible, and AI-assisted.</p>
  },
  {
    id: "sdg",
    title: "SDG Alignment",
    body: (
      <>
        <p><span className="font-semibold text-forest-800">Primary:</span> SDG 12 — Responsible Consumption and Production</p>
        <p className="mt-1"><span className="font-semibold text-forest-800">Secondary:</span> SDG 11 — Sustainable Cities and Communities, SDG 13 — Climate Action</p>
      </>
    )
  },
  {
    id: "problem",
    title: "The Problem",
    body: (
      <p>
        People frequently don't know how to correctly segregate unfamiliar waste items — from
        batteries to medicine packaging to broken electronics. Incorrect segregation contaminates
        recyclable waste, increases landfill volume, and creates avoidable environmental risk.
      </p>
    )
  },
  {
    id: "solution",
    title: "The Solution",
    body: (
      <p>
        EcoSort AI turns that decision into a simple flow: describe or photograph an item, and the
        system classifies it live via Groq, retrieves relevant disposal guidance through RAG, and
        explains its reasoning — with sustainability tips and a decision-support tool for less
        obvious cases.
      </p>
    )
  },
  {
    id: "ai-role",
    title: "Where AI is used",
    body: (
      <div className="flex flex-wrap gap-2">
        {["Classification", "RAG", "Conversational AI", "Decision Support", "Multimodal Input"].map((t) => (
          <span key={t} className="rounded-full bg-forest-50 px-3 py-1.5 text-xs font-semibold text-forest-700">{t}</span>
        ))}
      </div>
    )
  },
  {
    id: "pipeline",
    title: "EcoSort AI Pipeline",
    body: (
      <div className="flex flex-wrap items-center gap-2">
        {PIPELINE.map((p, i) => (
          <React.Fragment key={p}>
            <span className="rounded-full border border-forest-100 bg-white px-3 py-1.5 text-xs font-medium text-ink/70">{p}</span>
            {i < PIPELINE.length - 1 && <span className="text-ink/30">→</span>}
          </React.Fragment>
        ))}
      </div>
    )
  },
  {
    id: "tech",
    title: "AI Technologies actually used",
    body: (
      <>
        <ul className="space-y-1.5">
          {TECH.map((t) => (
            <li key={t} className="flex items-center gap-2 text-sm text-ink/70">
              <span className="h-1.5 w-1.5 rounded-full bg-forest-500" /> {t}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink/45">
          Image analysis in this prototype uses a labeled mock inference layer to guess a text
          label, which is then classified live by Groq — see the Identify page for details.
        </p>
      </>
    )
  },
  {
    id: "impact",
    title: "Expected Impact",
    body: (
      <p>
        By making correct segregation easier to understand in the moment of disposal, EcoSort AI
        aims to reduce recyclable contamination, encourage reuse over replacement, and build habits
        that scale into measurable community-level waste reduction over time.
      </p>
    )
  }
];

export default function About() {
  const [open, setOpen] = useState(new Set(["mission"]));

  function toggle(id) {
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function jumpTo(id) {
    setOpen((prev) => new Set(prev).add(id));
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="mx-auto max-w-3xl px-5 pb-20">
      <PageHeader eyebrow="About the project" title="About EcoSort AI" />

      <div className="sticky top-16 z-10 -mx-5 mb-8 overflow-x-auto bg-paper/95 px-5 py-3 backdrop-blur">
        <div className="flex gap-2">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => jumpTo(s.id)}
              className="focus-ring whitespace-nowrap rounded-full border border-forest-100 bg-white px-3 py-1.5 text-xs font-medium text-ink/65 transition-colors hover:border-forest-400 hover:text-forest-700"
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {SECTIONS.map((s) => {
          const isOpen = open.has(s.id);
          return (
            <div key={s.id} id={s.id} className="scroll-mt-32 rounded-2xl border border-forest-100 bg-white">
              <button
                onClick={() => toggle(s.id)}
                className="focus-ring flex w-full items-center justify-between p-5 text-left"
              >
                <h2 className="font-display text-lg font-semibold text-forest-900">{s.title}</h2>
                {isOpen ? <ChevronUp size={16} className="text-ink/40" /> : <ChevronDown size={16} className="text-ink/40" />}
              </button>
              {isOpen && <div className="px-5 pb-5 text-sm leading-relaxed text-ink/70">{s.body}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}