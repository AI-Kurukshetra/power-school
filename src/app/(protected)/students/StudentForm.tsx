"use client";

import type { FormEvent } from "react";
import { useActionState, useEffect, useState } from "react";
import { FormButton } from "@/components/FormButton";
import { useToast } from "@/components/Toast";
import { emptyFormState, studentSchema, type FieldErrors } from "@/lib/validation";
import { addStudent } from "./actions";

const gradeLevels = [
  "K",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];

function pickError(fieldErrors: FieldErrors, field: string) {
  return fieldErrors[field]?.[0] ?? null;
}

export function StudentForm() {
  const [state, action] = useActionState(addStudent, emptyFormState);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const { toast } = useToast();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      grade_level: String(formData.get("grade_level") ?? ""),
      parent_contact: String(formData.get("parent_contact") ?? ""),
    };

    const parsed = studentSchema.safeParse(payload);
    if (!parsed.success) {
      event.preventDefault();
      setClientErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    setClientErrors({});
  };

  useEffect(() => {
    if (state.error) {
      toast({
        title: "Unable to add student",
        description: state.error,
        variant: "error",
      });
    }
  }, [state.error, toast]);

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Student saved",
        description: state.success,
        variant: "success",
      });
    }
  }, [state.success, toast]);

  return (
    <form action={action} onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Student Name
          </label>
          <input
            name="name"
            required
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-foreground"
            placeholder="e.g. Ava Thompson"
          />
          {(pickError(clientErrors, "name") || state.fieldErrors.name) && (
            <p className="mt-2 text-xs text-rose-600">
              {pickError(clientErrors, "name") ?? state.fieldErrors.name?.[0]}
            </p>
          )}
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Grade Level
          </label>
          <select
            name="grade_level"
            required
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-foreground"
            defaultValue=""
          >
            <option value="" disabled>
              Select grade
            </option>
            {gradeLevels.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
          {(pickError(clientErrors, "grade_level") ||
            state.fieldErrors.grade_level) && (
            <p className="mt-2 text-xs text-rose-600">
              {pickError(clientErrors, "grade_level") ??
                state.fieldErrors.grade_level?.[0]}
            </p>
          )}
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Parent Email (Optional)
          </label>
          <input
            name="parent_contact"
            type="email"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-foreground"
            placeholder="parent@school.org"
          />
          {(pickError(clientErrors, "parent_contact") ||
            state.fieldErrors.parent_contact) && (
            <p className="mt-2 text-xs text-rose-600">
              {pickError(clientErrors, "parent_contact") ??
                state.fieldErrors.parent_contact?.[0]}
            </p>
          )}
        </div>
      </div>
      {state.error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">
          {state.error}
        </p>
      )}
      <FormButton pendingText="Saving student">Add student</FormButton>
    </form>
  );
}
