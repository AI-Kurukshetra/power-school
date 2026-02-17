export default function ProtectedLoading() {
  return (
    <div className="flex min-h-screen gap-6 px-6 pb-10 pt-6">
      <aside className="surface hidden h-[calc(100vh-3rem)] w-[270px] rounded-xl px-5 py-6 xl:flex">
        <div className="h-10 w-36 animate-pulse rounded-xl bg-slate-100" />
      </aside>
      <main className="flex-1">
        <div className="surface rounded-xl px-6 py-6">
          <div className="space-y-4">
            <div className="h-6 w-40 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-4 w-72 animate-pulse rounded-xl bg-slate-100" />
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
          </div>
        </div>
      </main>
    </div>
  );
}
