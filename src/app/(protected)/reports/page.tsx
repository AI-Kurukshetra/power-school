import type { Metadata } from "next";
import { SectionHeader } from "@/components/SectionHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { getUserRole } from "@/lib/auth";
import { getReportsSnapshot, getStudentsForSelect } from "@/lib/data";
import { ExportButtons } from "./ExportButtons";
import { FeeForm } from "./FeeForm";
import { ReportFilters } from "./ReportFilters";

type ReportsPageProps = {
  searchParams?: {
    from?: string;
    to?: string;
    feeStatus?: string;
  };
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Reports | Bac PowerSchool",
    description: "Attendance and fee reports with export options.",
  };
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const role = await getUserRole();
  const from = searchParams?.from;
  const to = searchParams?.to;
  const feeStatus =
    searchParams?.feeStatus === "Paid" || searchParams?.feeStatus === "Pending"
      ? searchParams.feeStatus
      : undefined;

  const canManageFees = role === "Admin";
  const [reports, students] = await Promise.all([
    getReportsSnapshot({
      attendanceFrom: from,
      attendanceTo: to,
      feeStatus,
    }),
    canManageFees ? getStudentsForSelect() : Promise.resolve([]),
  ]);
  const paidCount = reports.fees.filter((fee) => fee.status === "Paid").length;
  const pendingCount = reports.fees.filter(
    (fee) => fee.status === "Pending"
  ).length;
  const totalCount = paidCount + pendingCount;
  const paidPercent =
    totalCount === 0 ? 0 : Math.round((paidCount / totalCount) * 100);

  const queryParams = new URLSearchParams();
  if (from) queryParams.set("from", from);
  if (to) queryParams.set("to", to);
  if (feeStatus) queryParams.set("feeStatus", feeStatus);
  const queryString = queryParams.toString();
  const feeQuery = queryString ? `?${queryString}` : "";
  const attendanceQuery = queryString ? `?${queryString}` : "";

  return (
    <section className="space-y-10">
      <SectionHeader
        title="Reports"
        subtitle="Track fee status and attendance trends."
      />

      {role === "Teacher" && (
        <ReportFilters
          initialFrom={from}
          initialTo={to}
          initialFeeStatus={feeStatus ?? "All"}
        />
      )}

      {(role === "Admin" || role === "Teacher") && (
        <ExportButtons
          feeQuery={feeQuery}
          attendanceQuery={attendanceQuery}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="surface rounded-xl p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Attendance Trend
          </p>
          <h3 className="mt-2 text-xl font-semibold text-foreground">
            Last 14 days
          </h3>
          {reports.attendanceTrend.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              No attendance records yet.
            </p>
          ) : (
            <div className="mt-6 flex h-32 items-end gap-2">
              {reports.attendanceTrend.map((entry) => (
                <div
                  key={entry.date}
                  className="flex-1 rounded-xl bg-primary-200/60"
                  style={{ height: `${Math.max(entry.percent, 8)}%` }}
                  title={`${entry.date} - ${entry.percent}%`}
                />
              ))}
            </div>
          )}
        </div>
        <div className="surface rounded-xl p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Fee Collection
          </p>
          <h3 className="mt-2 text-xl font-semibold text-foreground">
            Paid vs pending
          </h3>
          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-primary-600"
                style={{ width: `${paidPercent}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
              <span>Paid: {paidCount}</span>
              <span>Pending: {pendingCount}</span>
            </div>
          </div>
        </div>
      </div>

      {canManageFees ? (
        <div className="surface rounded-xl p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Log a Fee
          </p>
          <h3 className="mt-2 text-xl font-semibold text-foreground">
            Add a new fee entry
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Create or update fee records for enrolled students.
          </p>
          <div className="mt-6">
            <FeeForm students={students} />
          </div>
        </div>
      ) : (
        <div className="surface rounded-xl p-6 text-sm text-slate-600">
          Fee management is available to Admins only.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="surface rounded-xl p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Fee Status
          </p>
          <h3 className="mt-2 text-xl font-semibold text-foreground">
            Outstanding balances
          </h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="px-3 py-2">Student ID</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Due</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.fees.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-slate-600" colSpan={4}>
                      No fee records available.
                    </td>
                  </tr>
                ) : (
                  reports.fees.map((fee) => (
                    <tr key={fee.id}>
                      <td className="px-3 py-3 text-slate-600">
                        {fee.student_id}
                      </td>
                      <td className="px-3 py-3 font-semibold text-foreground">
                        ${Number(fee.amount).toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {fee.due_date}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge label={fee.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="surface rounded-xl p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Attendance Detail
          </p>
          <h3 className="mt-2 text-xl font-semibold text-foreground">
            Daily attendance breakdown
          </h3>
          {reports.attendanceTrend.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              No attendance records yet.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {reports.attendanceTrend.map((entry) => (
                <div
                  key={entry.date}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {entry.date}
                    </p>
                    <p className="text-xs text-slate-600">
                      {entry.total} records
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-primary-600">
                      {entry.percent}%
                    </p>
                    <p className="text-xs text-slate-600">Present</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
