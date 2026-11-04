import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/** KPI tile with an optional period-over-period delta. */
export function StatCard({
  label,
  value,
  icon,
  delta,
}: {
  label: string;
  value: string;
  icon: IconName;
  delta?: number | null;
}) {
  const up = delta != null && delta >= 0;
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-cocoa/60">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#1F253F]">
            {value}
          </p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-xl bg-cream text-cocoa">
          <Icon name={icon} className="size-5" />
        </span>
      </div>
      {delta != null && (
        <p
          className={cn(
            "mt-3 flex items-center gap-1 text-xs font-medium",
            up ? "text-emerald-600" : "text-red-500",
          )}
        >
          <Icon
            name="trendingUp"
            className={cn("size-3.5", !up && "rotate-180")}
          />
          {up ? "+" : ""}
          {Math.round(delta)}% vs previous 30 days
        </p>
      )}
    </div>
  );
}
