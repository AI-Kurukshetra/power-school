type StatCardProps = {
  label: string;
  value: string;
  caption?: string;
};

export function StatCard({ label, value, caption }: StatCardProps) {
  return (
    <div className="surface flex flex-col gap-2 rounded-xl p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
        {label}
      </p>
      <p className="text-3xl font-semibold text-foreground">{value}</p>
      {caption && <p className="text-sm text-slate-600">{caption}</p>}
    </div>
  );
}
