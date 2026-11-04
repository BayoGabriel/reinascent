import { cn } from "@/lib/utils";

interface StarsProps {
  value: number;
  className?: string;
}

/** Filled-star row — a star is clipped by percentage for fractional ratings. */
export function Stars({ value, className }: StarsProps) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.min(1, Math.max(0, value - i)) * 100;
        return (
          <span key={i} className="relative inline-block size-4">
            <StarShape className="absolute inset-0 text-line" />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill}%` }}
            >
              <StarShape className="size-4 text-gold" />
            </span>
          </span>
        );
      })}
    </span>
  );
}

function StarShape({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.5 14.9 8.6l6.6.7-4.9 4.5 1.4 6.5L12 17l-6 3.3 1.4-6.5L2.5 9.3l6.6-.7L12 2.5Z" />
    </svg>
  );
}
