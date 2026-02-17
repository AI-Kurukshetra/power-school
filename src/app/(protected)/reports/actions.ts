"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { emptyFormState, feeSchema, type FormState } from "@/lib/validation";

export async function addFee(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const payload = {
    student_id: String(formData.get("student_id") ?? ""),
    amount: formData.get("amount"),
    status: String(formData.get("status") ?? ""),
    due_date: String(formData.get("due_date") ?? ""),
  };

  const parsed = feeSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      error: "Please correct the highlighted fields.",
      success: null,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();
  try {
    const { error } = await supabase.from("fees").insert(parsed.data);

    if (error) {
      return {
        error: error.message,
        success: null,
        fieldErrors: {},
      };
    }

    revalidatePath("/reports");
    revalidatePath("/");
    return { ...emptyFormState, success: "Fee record added." };
  } catch {
    return {
      error: "We couldn't add the fee record. Please try again.",
      success: null,
      fieldErrors: {},
    };
  }
}
