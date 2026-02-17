"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  attendanceSchema,
  emptyFormState,
  studentLinkSchema,
  studentSchema,
  type FormState,
} from "@/lib/validation";

export async function markAttendance(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const payload = {
    student_id: String(formData.get("student_id") ?? ""),
    status: String(formData.get("status") ?? ""),
    date: String(formData.get("date") ?? ""),
  };

  const parsed = attendanceSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      error: "Invalid attendance entry.",
      success: null,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();
  try {
    const { data: existing, error: existingError } = await supabase
      .from("attendance")
      .select("status")
      .eq("student_id", parsed.data.student_id)
      .eq("date", parsed.data.date)
      .maybeSingle();

    if (existingError) {
      return {
        error: "Unable to check existing attendance.",
        success: null,
        fieldErrors: {},
      };
    }

    const { error } = await supabase.from("attendance").upsert(parsed.data, {
      onConflict: "student_id,date",
    });

    if (error) {
      return {
        error: error.message,
        success: null,
        fieldErrors: {},
      };
    }

    revalidatePath("/students");
    revalidatePath("/");
    revalidatePath("/reports");

    const success = existing
      ? existing.status === parsed.data.status
        ? "Attendance already recorded for this date."
        : "Attendance updated for this date."
      : "Attendance recorded.";

    return { ...emptyFormState, success };
  } catch {
    return {
      error: "We couldn't record attendance. Please try again.",
      success: null,
      fieldErrors: {},
    };
  }
}

export async function addStudent(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const payload = {
    name: String(formData.get("name") ?? ""),
    grade_level: String(formData.get("grade_level") ?? ""),
    parent_contact: String(formData.get("parent_contact") ?? ""),
  };

  const parsed = studentSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      error: "Please correct the highlighted fields.",
      success: null,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();
  try {
    const { error } = await supabase.from("students").insert(parsed.data);

    if (error) {
      return {
        error: error.message,
        success: null,
        fieldErrors: {},
      };
    }

    revalidatePath("/students");
    revalidatePath("/");
    revalidatePath("/reports");
    return { ...emptyFormState, success: "Student added successfully." };
  } catch {
    return {
      error: "We couldn't add the student. Please try again.",
      success: null,
      fieldErrors: {},
    };
  }
}

export async function updateStudentLink(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const payload = {
    student_id: String(formData.get("student_id") ?? ""),
    auth_user_id: String(formData.get("auth_user_id") ?? ""),
    intent: String(formData.get("intent") ?? ""),
  };

  const parsed = studentLinkSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      error: "Please provide a valid student and auth user id.",
      success: null,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (parsed.data.intent === "link" && !parsed.data.auth_user_id) {
    return {
      error: "Auth user id is required to link.",
      success: null,
      fieldErrors: { auth_user_id: ["Auth user id is required."] },
    };
  }

  const supabase = await createSupabaseServerClient();
  const updatePayload =
    parsed.data.intent === "unlink"
      ? { auth_user_id: null }
      : { auth_user_id: parsed.data.auth_user_id };

  try {
    const { error } = await supabase
      .from("students")
      .update(updatePayload)
      .eq("id", parsed.data.student_id);

    if (error) {
      return {
        error: error.message,
        success: null,
        fieldErrors: {},
      };
    }

    revalidatePath("/students");
    revalidatePath("/");
    const success =
      parsed.data.intent === "unlink"
        ? "Student profile unlinked."
        : "Student profile linked.";
    return { ...emptyFormState, success };
  } catch {
    return {
      error: "We couldn't update the student link. Please try again.",
      success: null,
      fieldErrors: {},
    };
  }
}
