export function DashboardSkeleton() {
  return (
    <section className="space-y-8">
      <div>
        <div className="h-6 w-40 animate-pulse rounded-xl bg-slate-100" />
        <div className="mt-3 h-4 w-72 animate-pulse rounded-xl bg-slate-100" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="surface h-32 animate-pulse rounded-xl" />
        <div className="surface h-32 animate-pulse rounded-xl" />
        <div className="surface h-32 animate-pulse rounded-xl" />
      </div>
      <div className="surface h-48 animate-pulse rounded-xl" />
      <div className="surface h-40 animate-pulse rounded-xl" />
      <div className="surface h-28 animate-pulse rounded-xl" />
    </section>
  );
}
