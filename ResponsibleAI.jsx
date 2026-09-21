import React, { useState } from "react";
import { Scale, Eye, ShieldCheck, Lock, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";

const PRINCIPLES = [
  {
    icon: Scale,
    title: "Fairness",
    summary: "One rule doesn't fit every location.",
    text: "EcoSort AI avoids assuming that one disposal rule applies universally — guidance is framed as general practice, and location-specific claims are clearly labeled as estimates. The Local Guide page exists specifically so location differences aren't papered over."
  },
  {
    icon: Eye,
    title: "Transparency",
    summary: "Every answer shows its reasoning.",
    text: "Every result explains why an item was classified the way it was, and shows which knowledge-base documents were retrieved to generate the recommendation. Open the \"Why did EcoSort recommend this?\" panel on any result to see the exact retrieval and reasoning trail."
  },
  {
    icon: ShieldCheck,
    title: "Ethics",
    summary: "Never misleading, never unsafe.",
    text: "The system is designed to never provide misleading or unsafe disposal instructions, and defers to official guidance for hazardous or ambiguous cases rather than guessing with false confidence."
  },
  {
    icon: Lock,
    title: "Privacy",
    summary: "Your uploads aren't hoarded.",
    text: "Uploaded images are processed in-session and are not unnecessarily stored or shared beyond what's needed to generate a result. No image is retained after your session ends."
  },
  {
    icon: HelpCircle,
    title: "Uncertainty",
    summary: "Low confidence is stated, not hidden.",
    text: "When confidence is low, EcoSort says so directly rather than guessing, and points users toward clearer input or local authorities instead of presenting a shaky guess as fact."
  }
];

export default function ResponsibleAI() {
  const [open, setOpen] = useState(0);

  return (
    <div className="mx-auto max-w-3xl px-5 pb-20">
      <PageHeader
        eyebrow="Responsible AI"
        title="Built with care, not just capability"
        subtitle="Tap a principle to see how it's actually implemented, not just promised."
      />

      <div className="space-y-3">
        {PRINCIPLES.map((p, i) => {
          const isOpen = open === i;
          return (
            <div key={p.title} className="rounded-2xl border border-forest-100 bg-white">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="focus-ring flex w-full items-center gap-4 p-6 text-left"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-forest-50 text-forest-700">
                  <p.icon size={20} />
                </span>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold text-forest-900">{p.title}</h3>
                  <p className="mt-0.5 text-sm text-ink/50">{p.summary}</p>
                </div>
                {isOpen ? <ChevronUp size={18} className="text-ink/40" /> : <ChevronDown size={18} className="text-ink/40" />}
              </button>
              {isOpen && (
                <div className="border-t border-forest-100 px-6 pb-6 pt-4">
                  <p className="text-sm leading-relaxed text-ink/70">{p.text}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl bg-forest-900 p-6 text-center text-paper">
        <p className="font-display text-base">
          EcoSort AI is an educational decision-support tool. Disposal rules may vary by
          location. Always follow official local waste-management guidance.
        </p>
      </div>
    </div>
  );
}