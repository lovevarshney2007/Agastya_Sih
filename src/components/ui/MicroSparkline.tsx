export interface MicroSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  tone?: 'brand' | 'ok' | 'warn' | 'bad' | 'saffron';
}

const STROKE_COLORS: Record<string, string> = {
  brand: '#00D9E8', // Cyan for sovereign high-contrast analytics
  ok: '#00D68F',    // Success emerald
  warn: '#FFB020',  // Warning gold/amber
  bad: '#FF5263',   // Critical crimson
  saffron: '#FFD400', // Institutional gold
  cyan: '#00D9E8',
};

/**
 * MicroSparkline for high-density regulatory KPI cards.
 * Avoids messy gradients, maintaining clean institutional SVG line paths.
 */
export function MicroSparkline({
  data,
  width = 54,
  height = 20,
  tone = 'brand',
}: MicroSparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 2;
  const innerH = height - pad * 2;
  const innerW = width - pad * 2;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * innerW;
    const y = pad + innerH - ((v - min) / range) * innerH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const stroke = STROKE_COLORS[tone] || STROKE_COLORS.brand;

  const lastPoint = points[points.length - 1].split(',');
  const lastX = Number(lastPoint[0]);
  const lastY = Number(lastPoint[1]);

  return (
    <svg width={width} height={height} className="shrink-0 overflow-visible" aria-hidden="true">
      <path
        d={pathD}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r="2" fill={stroke} />
    </svg>
  );
}
