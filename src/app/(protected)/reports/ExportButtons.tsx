"use client";

import { useState } from "react";
import { Spinner } from "@/components/Spinner";

type ExportButtonsProps = {
  feeQuery?: string;
  attendanceQuery?: string;
};

export function ExportButtons({
  feeQuery = "",
  attendanceQuery = "",
}: ExportButtonsProps) {
  const [loading, setLoading] = useState<null | "fees" | "attendance">(null);

  const handleExport = (type: "fees" | "attendance") => {
    setLoading(type);
    const url =
      type === "fees"
        ? `/reports/fees/export${feeQuery}`
        : `/reports/attendance/export${attendanceQuery}`;

    setTimeout(() => {
      window.location.href = url;
      setTimeout(() => setLoading(null), 1000);
    }, 50);
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => handleExport("fees")}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary-200 hover:text-primary-700"
      >
        {loading === "fees" ? <Spinner className="h-4 w-4" /> : null}
        Export Fees CSV
      </button>
      <button
        type="button"
        onClick={() => handleExport("attendance")}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary-200 hover:text-primary-700"
      >
        {loading === "attendance" ? <Spinner className="h-4 w-4" /> : null}
        Export Attendance CSV
      </button>
    </div>
  );
}
