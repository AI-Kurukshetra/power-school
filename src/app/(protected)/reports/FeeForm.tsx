"use client";

import type { FormEvent } from "react";
import { useActionState, useEffect, useState } from "react";
import { FormButton } from "@/components/FormButton";
import { useToast } from "@/components/Toast";
import { emptyFormState, feeSchema, type FieldErrors } from "@/lib/validation";
import { addFee } from "./actions";

type StudentOption = {
  id: string;
  name: string;
};

type FeeFormProps = {
  students: StudentOption[];
};

function pickError(fieldErrors: FieldErrors, field: string) {
  return fieldErrors[field]?.[0] ?? null;
}

export function FeeForm({ students }: FeeFormProps) {
  const [state, action] = useActionState(addFee, emptyFormState);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const isDisabled = students.length === 0;
  const { toast } = useToast();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    const payload = {
      student_id: String(formData.get("student_id") ?? ""),
      amount: formData.get("amount"),
      status: String(formData.get("status") ?? ""),
      due_date: String(formData.get("due_date") ?? ""),
    };

    const parsed = feeSchema.safeParse(payload);
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
        title: "Unable to add fee",
        description: state.error,
        variant: "error",
      });
    }
  }, [state.error, toast]);

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Fee saved",
        description: state.success,
        variant: "success",
      });
    }
  }, [state.success, toast]);

  return (
    <form action={action} onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Student
          </label>
          <select
            name="student_id"
            required
            disabled={isDisabled}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-foreground"
            defaultValue=""
          >
            <option value="" disabled>
              {isDisabled ? "Add students first" : "Select student"}
            </option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
          {(pickError(clientErrors, "student_id") ||
            state.fieldErrors.student_id) && (
            <p className="mt-2 text-xs text-rose-600">
              {pickError(clientErrors, "student_id") ??
                state.fieldErrors.student_id?.[0]}
            </p>
          )}
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Amount
          </label>
          <input
            name="amount"
            type="number"
            min="1"
            step="0.01"
            required
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-foreground"
            placeholder="500"
          />
          {(pickError(clientErrors, "amount") || state.fieldErrors.amount) && (
            <p className="mt-2 text-xs text-rose-600">
              {pickError(clientErrors, "amount") ??
                state.fieldErrors.amount?.[0]}
            </p>
          )}
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Status
          </label>
          <select
            name="status"
            required
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-foreground"
            defaultValue="Pending"
          >
            <option>Pending</option>
            <option>Paid</option>
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Due Date
          </label>
          <input
            name="due_date"
            type="date"
            required
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-foreground"
          />
          {(pickError(clientErrors, "due_date") ||
            state.fieldErrors.due_date) && (
            <p className="mt-2 text-xs text-rose-600">
              {pickError(clientErrors, "due_date") ??
                state.fieldErrors.due_date?.[0]}
            </p>
          )}
        </div>
      </div>
      {state.error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">
          {state.error}
        </p>
      )}
      <FormButton pendingText="Saving fee" disabled={isDisabled}>
        Add fee
      </FormButton>
    </form>
  );
}
