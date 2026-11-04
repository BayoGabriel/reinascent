const COLORS: Record<string, string> = {
  paid: "#b08d4a",
  pending: "#d9b96c",
  failed: "#c05c5c",
};

const R = 56;
const C = 2 * Math.PI * R;

/** Orders-by-payment-status donut with legend. */
export function StatusDonut({ counts }: { counts: Record<string, number> }) {
  const entries = Object.entries(counts).filter(([, n]) => n > 0);
  const total = entries.reduce((s, [, n]) => s + n, 0) || 1;
  let offset = 0;
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 140 140" className="size-32 -rotate-90">
        <circle cx="70" cy="70" r={R} fill="none" stroke="#f0eade" strokeWidth="16" />
        {entries.map(([status, n]) => {
          const frac = n / total;
          const el = (
            <circle
              key={status}
              cx="70"
              cy="70"
              r={R}
              fill="none"
              stroke={COLORS[status] ?? "#6b5b3e"}
              strokeWidth="16"
              strokeDasharray={`${frac * C} ${C}`}
              strokeDashoffset={-offset * C}
            />
          );
          offset += frac;
          return el;
        })}
      </svg>
      <div className="space-y-2">
        <p className="text-2xl font-semibold text-[#1F253F]">{total}</p>
        <p className="-mt-2 text-xs text-cocoa/60">orders total</p>
        {entries.map(([status, n]) => (
          <p key={status} className="flex items-center gap-2 text-sm text-cocoa">
            <span
              className="size-2.5 rounded-full"
              style={{ background: COLORS[status] ?? "#6b5b3e" }}
            />
            <span className="capitalize">{status}</span>
            <span className="font-medium text-[#1F253F]">{n}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
