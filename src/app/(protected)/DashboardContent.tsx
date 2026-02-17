import { SectionHeader } from "@/components/SectionHeader";
import { StatCard } from "@/components/StatCard";
import { getUser, getUserRole } from "@/lib/auth";
import {
  getAttendanceTrend,
  getDashboardMetrics,
  getStudentDashboard,
} from "@/lib/data";

export async function DashboardContent() {
  const user = await getUser();
  const role = await getUserRole(user);

  if (role === "Student") {
    const studentData = await getStudentDashboard(user?.id);
    const currency = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });

    return (
      <section className="space-y-8">
        <SectionHeader
          title="Student Dashboard"
          subtitle="Track your attendance and fee status."
        />
        {studentData ? (
          <>
            <div className="surface rounded-xl p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Student Profile
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-foreground">
                {studentData.student.name}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {studentData.student.grade_level}
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <StatCard
                label="Attendance (14 days)"
                value={`${studentData.attendancePercent}%`}
                caption={`${studentData.attendanceRecords} records logged`}
              />
              <StatCard
                label="Pending Fees"
                value={currency.format(studentData.pendingFeesTotal)}
                caption="Outstanding balance"
              />
              <StatCard
                label="Next Due Date"
                value={studentData.nextDue ?? "-"}
                caption="Upcoming payment"
              />
            </div>
            <div className="surface rounded-xl p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Session Details
              </p>
              <div className="mt-4 grid gap-2 text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-foreground">Role:</span>{" "}
                  {role}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Email:</span>{" "}
                  {user?.email ?? "-"}
                </p>
                <p>
                  <span className="font-semibold text-foreground">
                    Linked Student:
                  </span>{" "}
                  {studentData.student.id}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="surface rounded-xl p-6 text-sm text-slate-600">
            No student profile is linked to your account yet.
          </div>
        )}
      </section>
    );
  }

  const [metrics, attendanceTrend] = await Promise.all([
    getDashboardMetrics(),
    getAttendanceTrend(),
  ]);
  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <section className="space-y-8">
      <SectionHeader
        title="Dashboard"
        subtitle="A snapshot of enrollment, attendance, and fee collection."
      />

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          label="Total Students"
          value={metrics.totalStudents.toString()}
          caption="Active enrollments across all grades."
        />
        <StatCard
          label="Attendance Today"
          value={`${metrics.attendancePercent}%`}
          caption="Percent marked present for today."
        />
        <StatCard
          label="Pending Fees"
          value={currency.format(metrics.pendingFeesTotal)}
          caption="Outstanding balances awaiting payment."
        />
      </div>

      <div className="surface rounded-xl p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Attendance Trend
        </p>
        <h3 className="mt-2 text-xl font-semibold text-foreground">
          Last 14 days
        </h3>
        {attendanceTrend.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">
            No attendance records yet.
          </p>
        ) : (
          <>
            <div className="mt-6 flex h-32 items-end gap-2">
              {attendanceTrend.map((entry) => (
                <div
                  key={entry.date}
                  className="flex-1 rounded-xl bg-primary-200/60"
                  style={{ height: `${Math.max(entry.percent, 8)}%` }}
                  title={`${entry.date} - ${entry.percent}%`}
                />
              ))}
            </div>
            <div className="mt-6 space-y-3">
              {attendanceTrend.map((entry) => (
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
          </>
        )}
      </div>

      <div className="surface grid gap-6 rounded-xl p-6 md:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Quick Actions
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-foreground">
            Daily Operations
          </h3>
          <p className="mt-3 text-sm text-slate-600">
            Keep student records, attendance, and fee tracking up to date to
            maintain real-time accuracy for leaders and teachers.
          </p>
        </div>
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-foreground">Suggested workflow</p>
          <p className="mt-2">1. Review absences from today.</p>
          <p>2. Follow up on pending balances.</p>
          <p>3. Export weekly attendance report.</p>
        </div>
      </div>

      <div className="surface rounded-xl p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Session Details
        </p>
        <div className="mt-4 grid gap-2 text-sm text-slate-600">
          <p>
            <span className="font-semibold text-foreground">Role:</span> {role}
          </p>
          <p>
            <span className="font-semibold text-foreground">Email:</span>{" "}
            {user?.email ?? "-"}
          </p>
          <p>
            <span className="font-semibold text-foreground">User ID:</span>{" "}
            {user?.id ?? "-"}
          </p>
        </div>
      </div>
    </section>
  );
}
