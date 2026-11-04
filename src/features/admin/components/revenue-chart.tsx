import { formatPrice } from "@/lib/money";

interface Point {
  date: string;
  total: number;
}

const W = 720;
const H = 220;
const PAD = { t: 16, r: 8, b: 26, l: 52 };

/** Smooth revenue area chart — pure SVG, no dependencies. */
export function RevenueChart({ data }: { data: Point[] }) {
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const max = Math.max(...data.map((d) => d.total), 1);
  const x = (i: number) => PAD.l + (i / Math.max(data.length - 1, 1)) * iw;
  const y = (v: number) => PAD.t + ih - (v / max) * ih;
  const pts = data.map((d, i) => `${x(i)},${y(d.total)}`);
  const line = `M${pts.join(" L")}`;
  const area = `${line} L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const ticks = [0, 0.5, 1].map((f) => ({ y: y(max * f), v: max * f }));
  const labelIdx = [0, Math.floor(data.length / 2), data.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Revenue chart">
      <defs>
        <linearGradient id="revfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b08d4a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#b08d4a" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.l} x2={W - PAD.r} y1={t.y} y2={t.y} stroke="#e7dfd0" strokeWidth="1" />
          <text x={PAD.l - 8} y={t.y + 4} textAnchor="end" fontSize="10" fill="#6b5b3e" opacity="0.7">
            {t.v >= 1000 ? `$${(t.v / 1000).toFixed(1)}k` : `$${Math.round(t.v)}`}
          </text>
        </g>
      ))}
      <path d={area} fill="url(#revfill)" />
      <path d={line} fill="none" stroke="#b08d4a" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <g key={d.date}>
          <circle cx={x(i)} cy={y(d.total)} r="3" fill="#b08d4a" opacity={i === data.length - 1 || i === 0 ? 1 : 0}>
            <title>{`${d.date}: ${formatPrice(d.total)}`}</title>
          </circle>
          {labelIdx.includes(i) && (
            <text x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#6b5b3e" opacity="0.7">
              {d.date.slice(5)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
