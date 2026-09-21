import React from "react";
import { NavLink } from "react-router-dom";
import { Sprout } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-forest-100 bg-forest-900 text-paper/80">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 text-paper">
            <Sprout size={18} />
            <span className="font-display text-lg font-semibold">EcoSort AI</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-paper/60">
            Know your waste. Make the right choice. An educational AI decision-support
            prototype for responsible waste segregation.
          </p>
        </div>

        <div>
          <p className="type-eyebrow text-xs text-forest-100/80">Product</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><NavLink to="/identify" className="hover:text-white">Identify Waste</NavLink></li>
            <li><NavLink to="/ask-ai" className="hover:text-white">Ask EcoSort AI</NavLink></li>
            <li><NavLink to="/categories" className="hover:text-white">Explore Categories</NavLink></li>
            <li><NavLink to="/local-guide" className="hover:text-white">Local Guide</NavLink></li>
          </ul>
        </div>

        <div>
          <p className="type-eyebrow text-xs text-forest-100/80">Project</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><NavLink to="/responsible-ai" className="hover:text-white">Responsible AI</NavLink></li>
            <li><NavLink to="/knowledge-base" className="hover:text-white">Knowledge Base</NavLink></li>
            <li><NavLink to="/analytics" className="hover:text-white">Analytics</NavLink></li>
            <li><NavLink to="/about" className="hover:text-white">About</NavLink></li>
          </ul>
        </div>

        <div>
          <p className="type-eyebrow text-xs text-forest-100/80">SDG Alignment</p>
          <ul className="mt-3 space-y-1 text-sm text-paper/70">
            <li>SDG 12 — Responsible Consumption</li>
            <li>SDG 11 — Sustainable Cities</li>
            <li>SDG 13 — Climate Action</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-paper/50">
        EcoSort AI is an educational decision-support prototype. Disposal rules vary by
        location — always follow official local waste-management guidance.
      </div>
    </footer>
  );
}
