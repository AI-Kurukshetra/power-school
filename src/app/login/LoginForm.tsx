"use client";

import { useActionState, useEffect } from "react";
import { FormButton } from "@/components/FormButton";
import { useToast } from "@/components/Toast";
import { signIn } from "@/lib/server-actions";
import { emptyFormState } from "@/lib/validation";

export function LoginForm() {
  const [state, action] = useActionState(signIn, emptyFormState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        title: "Sign in failed",
        description: state.error,
        variant: "error",
      });
    }
  }, [state.error, toast]);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary-500"
        />
        {state.fieldErrors.email && (
          <p className="mt-2 text-xs text-rose-600">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Password
        </label>
        <input
          name="password"
          type="password"
          required
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary-500"
        />
        {state.fieldErrors.password && (
          <p className="mt-2 text-xs text-rose-600">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>
      {state.error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {state.error}
        </p>
      )}
      <FormButton className="w-full" pendingText="Signing in">
        Sign in
      </FormButton>
    </form>
  );
}
