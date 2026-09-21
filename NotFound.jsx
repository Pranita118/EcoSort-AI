import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-5 py-24 text-center">
      <p className="font-display text-6xl font-semibold text-forest-900">404</p>
      <p className="mt-3 text-ink/60">This page doesn't exist — maybe it got recycled.</p>
      <Link to="/" className="mt-6 inline-block rounded-full bg-forest-700 px-6 py-3 text-sm font-semibold text-paper">
        Back to Home
      </Link>
    </div>
  );
}
