import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Unauthorized | Bac PowerSchool",
    description: "Your account does not have access to this section.",
  };
}

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="surface w-full max-w-lg rounded-xl p-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Access Restricted
        </p>
        <h1 className="mt-3 font-display text-3xl text-foreground">
          Unauthorized Role
        </h1>
        <p className="mt-4 text-sm text-slate-600">
          Your account does not have Admin or Teacher access. Please contact the
          school administrator to update your role metadata in Supabase.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-xl bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          Back to Sign in
        </Link>
      </div>
    </div>
  );
}
