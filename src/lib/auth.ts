import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "./supabase/server";

export type UserRole = "Admin" | "Teacher" | "Student" | "Unknown";

export async function getUser() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function getUserRole(user?: User | null) {
  const currentUser = user ?? (await getUser());
  if (!currentUser) return "Unknown" as const;

  const appRole = currentUser.app_metadata?.role;
  const userRole = currentUser.user_metadata?.role;

  if (appRole === "Admin" || userRole === "Admin") return "Admin";
  if (appRole === "Teacher" || userRole === "Teacher") return "Teacher";
  if (appRole === "Student" || userRole === "Student") return "Student";
  return "Unknown" as const;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireMember() {
  const user = await requireUser();
  const role = await getUserRole(user);

  if (role === "Unknown") {
    redirect("/unauthorized");
  }

  return { user, role };
}
