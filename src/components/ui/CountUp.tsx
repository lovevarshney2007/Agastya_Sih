import { useEffect, useRef, useState, type ReactNode } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Enterprise numerical transition: counts up to target values smoothly using tabular numbers.
 * Respects system prefers-reduced-motion.
 */
export function CountUp({ value }: { value: ReactNode }) {
  const text = typeof value === 'number' ? String(value) : typeof value === 'string' ? value : null;
  const match = text ? /^([\d,]+(?:\.\d+)?)(.*)$/.exec(text) : null;
  const target = match ? Number(match[1].replace(/,/g, '')) : 0;
  const decimals = match?.[1].includes('.') ? match[1].split('.')[1].length : 0;

  const [shown, setShown] = useState(() => (match && !prefersReducedMotion() ? 0 : target));
  const shownRef = useRef(shown);

  useEffect(() => {
    const from = shownRef.current;
    if (!match || prefersReducedMotion() || from === target) {
      shownRef.current = target;
      setShown(target);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const duration = 500;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const v = from + (target - from) * (1 - Math.pow(1 - t, 3));
      shownRef.current = v;
      setShown(v);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, match]);

  if (!match) return <>{value}</>;

  const formatted = shown.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className="tabular-nums">
      {formatted}
      {match[2]}
    </span>
  );
}
