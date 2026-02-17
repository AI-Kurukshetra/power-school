"use client";

import type { FormEvent } from "react";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Spinner } from "@/components/Spinner";
import { useToast } from "@/components/Toast";
import { attendanceSchema, emptyFormState, type FieldErrors } from "@/lib/validation";
import { markAttendance } from "./actions";

type AttendanceFormProps = {
  studentId: string;
  date: string;
  defaultStatus: string;
};

function pickError(fieldErrors: FieldErrors, field: string) {
  return fieldErrors[field]?.[0] ?? null;
}

type StatusButtonProps = {
  label: string;
  value: string;
  active: boolean;
  pendingStatus: string | null;
  onSelect: (value: string) => void;
};

function StatusButton({
  label,
  value,
  active,
  pendingStatus,
  onSelect,
}: StatusButtonProps) {
  const { pending } = useFormStatus();
  const isPending = pending && pendingStatus === value;

  return (
    <button
      type="submit"
      name="status"
      value={value}
      onClick={() => onSelect(value)}
      className={[
        "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition",
        active
          ? "bg-primary-600 text-white shadow-sm shadow-primary-600/30"
          : "border border-slate-200 bg-white text-slate-600 hover:border-primary-200 hover:text-primary-700",
      ].join(" ")}
    >
      {isPending ? <Spinner className="h-3.5 w-3.5" /> : null}
      {label}
    </button>
  );
}

export function AttendanceForm({
  studentId,
  date,
  defaultStatus,
}: AttendanceFormProps) {
  const [state, action] = useActionState(markAttendance, emptyFormState);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    const payload = {
      student_id: String(formData.get("student_id") ?? ""),
      date: String(formData.get("date") ?? ""),
      status: String(formData.get("status") ?? ""),
    };

    const parsed = attendanceSchema.safeParse(payload);
    if (!parsed.success) {
      event.preventDefault();
      setClientErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    setClientErrors({});
  };

  useEffect(() => {
    setPendingStatus(null);
  }, [state]);

  useEffect(() => {
    if (state.error) {
      toast({
        title: "Unable to save attendance",
        description: state.error,
        variant: "error",
      });
    }
  }, [state.error, toast]);

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Attendance saved",
        description: state.success,
        variant: "success",
      });
    }
  }, [state.success, toast]);

  const error =
    pickError(clientErrors, "status") ??
    pickError(clientErrors, "date") ??
    pickError(clientErrors, "student_id") ??
    state.error;

  return (
    <form action={action} onSubmit={handleSubmit} className="space-y-2">
      <input type="hidden" name="student_id" value={studentId} />
      <input type="hidden" name="date" value={date} />
      <div className="flex flex-wrap items-center gap-3">
        <StatusButton
          label="Present"
          value="Present"
          active={defaultStatus === "Present"}
          pendingStatus={pendingStatus}
          onSelect={setPendingStatus}
        />
        <StatusButton
          label="Absent"
          value="Absent"
          active={defaultStatus === "Absent"}
          pendingStatus={pendingStatus}
          onSelect={setPendingStatus}
        />
        <StatusButton
          label="Tardy"
          value="Tardy"
          active={defaultStatus === "Tardy"}
          pendingStatus={pendingStatus}
          onSelect={setPendingStatus}
        />
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </form>
  );
}
