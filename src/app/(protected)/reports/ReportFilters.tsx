"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Spinner } from "@/components/Spinner";

type ReportFiltersProps = {
  initialFrom?: string;
  initialTo?: string;
  initialFeeStatus?: string;
};

export function ReportFilters({
  initialFrom = "",
  initialTo = "",
  initialFeeStatus = "All",
}: ReportFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [feeStatus, setFeeStatus] = useState(initialFeeStatus);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (feeStatus && feeStatus !== "All") params.set("feeStatus", feeStatus);

    startTransition(() => {
      router.push(`/reports?${params.toString()}`);
    });
  };

  const handleReset = () => {
    setFrom("");
    setTo("");
    setFeeStatus("All");
    startTransition(() => {
      router.push("/reports");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="surface rounded-xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Teacher Filters
          </p>
          <h3 className="mt-2 text-xl font-semibold text-foreground">
            Refine reports
          </h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          {isPending && (
            <>
              <Spinner className="h-4 w-4" />
              Applying
            </>
          )}
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
            From
          </label>
          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-foreground"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
            To
          </label>
          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-foreground"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Fee Status
          </label>
          <select
            value={feeStatus}
            onChange={(event) => setFeeStatus(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-foreground"
          >
            <option>All</option>
            <option>Paid</option>
            <option>Pending</option>
          </select>
        </div>
        <div className="flex items-end gap-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Spinner className="h-4 w-4" />
                Applying
              </>
            ) : (
              "Apply"
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary-200 hover:text-primary-700"
          >
            Reset
          </button>
        </div>
      </div>
    </form>
  );
}
