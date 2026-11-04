import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700",
  fulfilled: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  unfulfilled: "bg-amber-50 text-amber-700",
  failed: "bg-red-50 text-red-700",
  cancelled: "bg-zinc-100 text-zinc-600",
};

/** Small pill for payment/fulfillment states. */
export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        TONES[status] ?? "bg-zinc-100 text-zinc-600",
      )}
    >
      {status}
    </span>
  );
}
