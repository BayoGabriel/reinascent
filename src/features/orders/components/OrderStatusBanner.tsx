import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

interface OrderStatusBannerProps {
  paymentStatus: "pending" | "paid" | "failed";
  failed?: boolean;
}

const STYLES = {
  paid: "from-green-400/90 to-green-100/40 text-green-950",
  pending: "from-amber-300/80 to-amber-100/40 text-amber-950",
  failed: "from-red-300/80 to-red-100/40 text-red-950",
} as const;

const LABELS = {
  paid: "Transaction Successful",
  pending: "Payment Awaiting Confirmation",
  failed: "Payment Failed",
} as const;

/** Result strip shown under the Order Details heading. */
export function OrderStatusBanner({
  paymentStatus,
  failed,
}: OrderStatusBannerProps) {
  const status = failed && paymentStatus !== "paid" ? "failed" : paymentStatus;
  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-3 rounded-lg bg-gradient-to-r px-5 py-3.5",
        STYLES[status],
      )}
    >
      <Icon name={status === "failed" ? "alert" : "info"} className="size-5" />
      <p className="text-sm font-medium">{LABELS[status]}</p>
    </div>
  );
}
