import React from "react";

export default function PageHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-10 pt-14 text-center">
      {eyebrow && <p className="type-eyebrow text-sm">{eyebrow}</p>}
      <h1 className="mt-2 font-display text-4xl font-semibold text-forest-900 sm:text-5xl">
        {title}
      </h1>
      {subtitle && <p className="mx-auto mt-4 max-w-xl text-base text-ink/65">{subtitle}</p>}
    </div>
  );
}
