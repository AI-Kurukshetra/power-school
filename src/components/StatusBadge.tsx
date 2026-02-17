import { cn } from "@/lib/cn";

type StatusBadgeProps = {
  label: string;
};

export function StatusBadge({ label }: StatusBadgeProps) {
  const normalized = label.toLowerCase();
  const intent =
    normalized === "present" || normalized === "paid"
      ? "bg-emerald-100 text-emerald-700"
      : normalized === "tardy"
      ? "bg-amber-100 text-amber-700"
      : normalized === "absent" || normalized === "pending"
      ? "bg-rose-100 text-rose-700"
      : "bg-slate-100 text-slate-600";

  return (
    <span
      className={cn(
        "rounded-xl px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
        intent
      )}
    >
      {label}
    </span>
  );
}
