"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { FormButton } from "@/components/FormButton";
import { useToast } from "@/components/Toast";
import { emptyFormState, type FieldErrors } from "@/lib/validation";
import { updateStudentLink } from "./actions";

type StudentOption = {
  id: string;
  name: string;
  auth_user_id: string | null;
};

type LinkStudentFormProps = {
  students: StudentOption[];
};

function pickError(fieldErrors: FieldErrors, field: string) {
  return fieldErrors[field]?.[0] ?? null;
}

export function LinkStudentForm({ students }: LinkStudentFormProps) {
  const [state, action] = useActionState(updateStudentLink, emptyFormState);
  const [selectedId, setSelectedId] = useState(students[0]?.id ?? "");
  const [authUserId, setAuthUserId] = useState("");
  const isDisabled = students.length === 0;
  const { toast } = useToast();

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedId),
    [students, selectedId]
  );

  useEffect(() => {
    if (state.error) {
      toast({
        title: "Unable to update link",
        description: state.error,
        variant: "error",
      });
    }
  }, [state.error, toast]);

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Link updated",
        description: state.success,
        variant: "success",
      });
    }
  }, [state.success, toast]);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[1.3fr_1.5fr]">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Student
          </label>
          <select
            name="student_id"
            required
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            disabled={isDisabled}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-foreground"
          >
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
          {state.fieldErrors.student_id && (
            <p className="mt-2 text-xs text-rose-600">
              {state.fieldErrors.student_id[0]}
            </p>
          )}
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Auth User ID
          </label>
          <input
            name="auth_user_id"
            value={authUserId}
            onChange={(event) => setAuthUserId(event.target.value)}
            placeholder="Paste auth.users id"
            disabled={isDisabled}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-foreground"
          />
          {(pickError(state.fieldErrors, "auth_user_id") || state.error) && (
            <p className="mt-2 text-xs text-rose-600">
              {pickError(state.fieldErrors, "auth_user_id") ?? state.error}
            </p>
          )}
          <p className="mt-2 text-xs text-slate-500">
            Current link:{" "}
            {selectedStudent?.auth_user_id
              ? selectedStudent.auth_user_id
              : "Not linked"}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <FormButton
          name="intent"
          value="link"
          pendingText="Linking"
          disabled={isDisabled}
        >
          Link Student
        </FormButton>
        <FormButton
          name="intent"
          value="unlink"
          variant="secondary"
          pendingText="Unlinking"
          disabled={isDisabled}
        >
          Unlink Student
        </FormButton>
      </div>
    </form>
  );
}
