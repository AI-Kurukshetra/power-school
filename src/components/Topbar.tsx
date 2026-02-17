import { signOut } from "@/lib/server-actions";
import { FormButton } from "@/components/FormButton";

type TopbarProps = {
  userEmail?: string | null;
  role?: string;
};

export function Topbar({ userEmail, role }: TopbarProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Bac PowerSchool
        </p>
        <h1 className="font-display text-3xl text-foreground">
          School Management
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          SaaS-grade insights for attendance and fee tracking.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
          <span className="font-semibold text-foreground">{role ?? "—"}</span>
          <span className="mx-2 text-slate-200">|</span>
          <span>{userEmail ?? "Signed in"}</span>
        </div>
        <form action={signOut}>
          <FormButton pendingText="Signing out" size="md">
            Sign out
          </FormButton>
        </form>
      </div>
    </header>
  );
}
