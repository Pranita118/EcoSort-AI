import React, { useState } from "react";
import { MapPin, Info } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import PrototypeBadge from "../components/PrototypeBadge.jsx";

const LOCATIONS = {
  India: {
    Maharashtra: ["Mumbai", "Pune", "Nagpur"],
    Karnataka: ["Bengaluru", "Mysuru"],
    Delhi: ["New Delhi"]
  },
  "United States": {
    California: ["San Francisco", "Los Angeles"],
    "New York": ["New York City"]
  }
};

const SAMPLE_GUIDANCE = {
  "Mumbai": [
    "Wet and dry waste must be segregated at source as per municipal solid-waste rules.",
    "E-waste should be dropped at authorized collection centers, not mixed with household waste.",
    "Bulk/hazardous waste generators typically need a registered vendor for collection."
  ],
  "Pune": [
    "Source segregation into wet, dry, and hazardous streams is mandated at the housing-society level.",
    "Several city-run collection drives accept e-waste and batteries on scheduled days."
  ],
  "default": [
    "Segregate waste into wet, dry, and hazardous categories before collection.",
    "Use authorized e-waste and hazardous-waste collection points where available.",
    "Check with your municipal or local authority for exact scheduling and drop-off locations."
  ]
};

export default function LocalGuide() {
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("Maharashtra");
  const [city, setCity] = useState("Mumbai");

  const states = Object.keys(LOCATIONS[country] || {});
  const cities = LOCATIONS[country]?.[state] || [];
  const guidance = SAMPLE_GUIDANCE[city] || SAMPLE_GUIDANCE.default;

  return (
    <div className="mx-auto max-w-3xl px-5 pb-20">
      <PageHeader
        eyebrow="Local Disposal Guide"
        title="Guidance for your area"
        subtitle="Select a location to see sample disposal guidance retrieved from EcoSort's knowledge base."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Select
          label="Country"
          value={country}
          onChange={(v) => {
            setCountry(v);
            const firstState = Object.keys(LOCATIONS[v])[0];
            setState(firstState);
            setCity(LOCATIONS[v][firstState][0]);
          }}
          options={Object.keys(LOCATIONS)}
        />
        <Select
          label="State"
          value={state}
          onChange={(v) => {
            setState(v);
            setCity(LOCATIONS[country][v][0]);
          }}
          options={states}
        />
        <Select label="City" value={city} onChange={setCity} options={cities} />
      </div>

      <div className="mt-8 rounded-3xl border border-forest-100 bg-white p-7 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-display text-lg font-semibold text-forest-900">
            <MapPin size={18} className="text-forest-600" /> {city}, {state}, {country}
          </p>
          <PrototypeBadge>Prototype Demo Data</PrototypeBadge>
        </div>

        <ul className="mt-5 space-y-3">
          {guidance.map((g, i) => (
            <li key={i} className="flex gap-3 text-sm text-ink/70">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-forest-500" />
              {g}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-start gap-2 rounded-xl bg-forest-50 p-4 text-sm text-forest-800">
          <Info size={16} className="mt-0.5 shrink-0" />
          <p>Local disposal rules may vary. Please verify with your local municipal authority for exact requirements.</p>
        </div>
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-ink/70">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring w-full rounded-xl border border-forest-100 bg-white px-3 py-2.5"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
