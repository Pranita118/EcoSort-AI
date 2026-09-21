import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { Sprout, Menu, X, ChevronDown } from "lucide-react";
import StatusBadge from "./StatusBadge.jsx";

const PRIMARY_LINKS = [
  { to: "/", label: "Home" },
  { to: "/identify", label: "Identify" },
  { to: "/ask-ai", label: "Ask AI" },
  { to: "/my-actions", label: "My Actions" },
  { to: "/impact", label: "Impact" }
];

const EXPLORE_LINKS = [
  { to: "/decision-support", label: "Decision Tool", desc: "Reuse, repair, or recycle — guided" },
  { to: "/categories", label: "Categories", desc: "Browse and analyze by waste type" },
  { to: "/local-guide", label: "Local Guide", desc: "Guidance by country/state/city" },
  { to: "/learn", label: "Learn & Act", desc: "Tips, articles, and a quick quiz" },
  { to: "/knowledge-base", label: "Knowledge Center", desc: "Test the RAG retrieval yourself" },
  { to: "/analytics", label: "Analytics", desc: "Usage charts and AI-quality signals" },
  { to: "/responsible-ai", label: "Responsible AI", desc: "Fairness, ethics, privacy, uncertainty" },
  { to: "/about", label: "About", desc: "Mission, SDGs, and the AI pipeline" }
];

const ALL_LINKS = [...PRIMARY_LINKS, ...EXPLORE_LINKS];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const exploreRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (exploreRef.current && !exploreRef.current.contains(e.target)) {
        setExploreOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const linkClass = ({ isActive }) =>
    `whitespace-nowrap text-sm font-medium transition-colors hover:text-forest-700 ${
      isActive ? "text-forest-700" : "text-ink/70"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-forest-100 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <NavLink to="/" className="flex shrink-0 items-center gap-2" onClick={() => setOpen(false)}>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-forest-700 text-paper">
            <Sprout size={17} />
          </span>
          <span className="whitespace-nowrap font-display text-lg font-semibold text-forest-900">EcoSort AI</span>
        </NavLink>

        <nav className="hidden items-center gap-5 lg:flex">
          {PRIMARY_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}

          <div className="relative" ref={exploreRef}>
            <button
              onClick={() => setExploreOpen((v) => !v)}
              className="focus-ring flex items-center gap-1 whitespace-nowrap text-sm font-medium text-ink/70 transition-colors hover:text-forest-700"
              aria-expanded={exploreOpen}
            >
              Explore <ChevronDown size={14} className={`transition-transform ${exploreOpen ? "rotate-180" : ""}`} />
            </button>

            {exploreOpen && (
              <div className="absolute left-1/2 top-full z-50 mt-3 w-72 -translate-x-1/2 rounded-2xl border border-forest-100 bg-white p-2 shadow-soft">
                {EXPLORE_LINKS.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    onClick={() => setExploreOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-xl px-3 py-2.5 transition-colors ${
                        isActive ? "bg-forest-50" : "hover:bg-forest-50"
                      }`
                    }
                  >
                    <p className="text-sm font-semibold text-forest-900">{l.label}</p>
                    <p className="mt-0.5 text-xs text-ink/50">{l.desc}</p>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <StatusBadge />
          <NavLink
            to="/identify"
            className="whitespace-nowrap rounded-full bg-forest-700 px-4 py-2 text-sm font-semibold text-paper shadow-soft transition-transform hover:-translate-y-0.5"
          >
            Try EcoSort
          </NavLink>
        </div>

        <button
          className="focus-ring shrink-0 rounded-md p-2 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="max-h-[calc(100vh-64px)] overflow-y-auto border-t border-forest-100 bg-paper px-5 pb-5 lg:hidden">
          <nav className="flex flex-col gap-1 pt-3">
            {ALL_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive ? "bg-forest-50 text-forest-700" : "text-ink/80"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-3 flex items-center justify-between gap-3">
            <StatusBadge />
            <NavLink
              to="/identify"
              onClick={() => setOpen(false)}
              className="rounded-full bg-forest-700 px-4 py-2 text-sm font-semibold text-paper"
            >
              Try EcoSort
            </NavLink>
          </div>
        </div>
      )}
    </header>
  );
}