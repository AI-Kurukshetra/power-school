"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/server";
import { loginSchema, type FormState } from "./validation";

export async function signIn(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const payload = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      error: "Please correct the highlighted fields.",
      success: null,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createSupabaseServerClient();
  try {
    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      return {
        error: error.message,
        success: null,
        fieldErrors: {},
      };
    }
  } catch {
    return {
      error: "We couldn't sign you in. Please try again.",
      success: null,
      fieldErrors: {},
    };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = createSupabaseServerClient();
  try {
    await supabase.auth.signOut();
  } catch {
    // Ignore sign-out failures and proceed to login.
  }
  redirect("/login");
}

export type { FormState };
