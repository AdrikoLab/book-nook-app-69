import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "success" | "warning" | "destructive" | "info";
};

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning-foreground",
  destructive: "bg-destructive/12 text-destructive",
  info: "bg-info/15 text-info",
};

export function StatCard({ label, value, hint, icon: Icon, tone = "default" }: StatCardProps) {
  return (
    <div className="surface-panel flex min-w-0 flex-col gap-3 p-3 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-[11px] font-medium uppercase leading-snug tracking-wide text-muted-foreground sm:text-xs">{label}</p>
        {Icon ? (
          <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg sm:size-10 sm:rounded-xl", toneClasses[tone])}>
            <Icon className="size-4 sm:size-5" />
          </span>
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="break-words font-display text-base font-semibold leading-tight sm:text-xl">{value}</p>
        {hint ? <p className="mt-1 text-[11px] leading-snug text-muted-foreground sm:text-xs">{hint}</p> : null}
      </div>
    </div>
  );
}
