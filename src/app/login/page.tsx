import type { Metadata } from "next";
import { LogoMark } from "@/components/LogoMark";
import { LoginForm } from "./LoginForm";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Sign in | Bac PowerSchool",
    description: "Secure access to Bac PowerSchool dashboards and reports.",
  };
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="surface w-full max-w-md rounded-xl p-8">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center">
            <LogoMark className="h-12 w-12" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Bac PowerSchool
            </p>
            <h1 className="font-display text-2xl text-foreground">
              Sign in
            </h1>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Use your school credentials to access dashboards and reports.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
