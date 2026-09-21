import React, { useEffect, useRef, useState } from "react";

/**
 * Animates a number counting up from its previous value to `value`
 * whenever `value` changes, so dashboards feel alive instead of static.
 */
export default function AnimatedCounter({ value, duration = 700, decimals = 0, suffix = "" }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;

    const start = performance.now();
    cancelAnimationFrame(rafRef.current);

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = from + (to - from) * eased;
      setDisplay(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return (
    <span>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
