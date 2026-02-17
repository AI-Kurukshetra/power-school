export default function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="surface w-full max-w-md rounded-xl p-8">
        <div className="h-10 w-32 animate-pulse rounded-xl bg-slate-100" />
        <div className="mt-6 space-y-4">
          <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
