import { createSupabaseServerClient } from "./supabase/server";
import { getISODateNDaysAgo, getTodayISODate } from "./date";

type ReportFilters = {
  attendanceFrom?: string;
  attendanceTo?: string;
  feeStatus?: "Paid" | "Pending";
};

type AttendanceTrendItem = {
  date: string;
  percent: number;
  total: number;
};

function buildAttendanceTrend(records: { date: string; status: string }[]) {
  const trendMap = new Map<string, { present: number; total: number }>();
  records.forEach((record) => {
    const entry = trendMap.get(record.date) ?? { present: 0, total: 0 };
    entry.total += 1;
    if (record.status === "Present") entry.present += 1;
    trendMap.set(record.date, entry);
  });

  return Array.from(trendMap.entries())
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([date, stats]) => ({
      date,
      percent:
        stats.total === 0 ? 0 : Math.round((stats.present / stats.total) * 100),
      total: stats.total,
    }));
}

export async function getDashboardMetrics() {
  const supabase = await createSupabaseServerClient();

  const today = getTodayISODate();
  const [{ count: totalStudents }, { data: todayAttendance }, { data: pendingFees }] =
    await Promise.all([
      supabase.from("students").select("*", { count: "exact", head: true }),
      supabase.from("attendance").select("status").eq("date", today),
      supabase.from("fees").select("amount, status").eq("status", "Pending"),
    ]);

  const attendanceRecords = todayAttendance ?? [];
  const presentCount = attendanceRecords.filter(
    (record) => record.status === "Present"
  ).length;
  const attendancePercent =
    attendanceRecords.length === 0
      ? 0
      : Math.round((presentCount / attendanceRecords.length) * 100);

  const pendingFeesTotal =
    pendingFees?.reduce((sum, fee) => sum + Number(fee.amount ?? 0), 0) ?? 0;

  return {
    totalStudents: totalStudents ?? 0,
    attendancePercent,
    pendingFeesTotal,
  };
}

export async function getStudentsWithAttendance() {
  const supabase = await createSupabaseServerClient();
  const today = getTodayISODate();

  const [{ data: students }, { data: attendance }] = await Promise.all([
    supabase
      .from("students")
      .select("id, name, grade_level, parent_contact")
      .order("name"),
    supabase.from("attendance").select("student_id, status").eq("date", today),
  ]);

  const attendanceMap = new Map(
    (attendance ?? []).map((record) => [record.student_id, record.status])
  );

  return (
    students?.map((student) => ({
      ...student,
      todayStatus: attendanceMap.get(student.id) ?? "Not marked",
    })) ?? []
  );
}

export async function getReportsSnapshot(filters: ReportFilters = {}) {
  const supabase = await createSupabaseServerClient();
  const sinceDate = getISODateNDaysAgo(14);
  const attendanceFrom = filters.attendanceFrom ?? sinceDate;

  let feesQuery = supabase
    .from("fees")
    .select("id, student_id, amount, status, due_date")
    .order("due_date", { ascending: true });

  if (filters.feeStatus) {
    feesQuery = feesQuery.eq("status", filters.feeStatus);
  }

  let attendanceQuery = supabase
    .from("attendance")
    .select("date, status")
    .gte("date", attendanceFrom);

  if (filters.attendanceTo) {
    attendanceQuery = attendanceQuery.lte("date", filters.attendanceTo);
  }

  const [{ data: fees }, { data: attendance }] = await Promise.all([
    feesQuery,
    attendanceQuery,
  ]);

  const attendanceTrend = buildAttendanceTrend(attendance ?? []);

  return {
    fees: fees ?? [],
    attendanceTrend,
  };
}

export async function getStudentsForSelect() {
  const supabase = await createSupabaseServerClient();
  const { data: students } = await supabase
    .from("students")
    .select("id, name")
    .order("name");

  return students ?? [];
}

export async function getStudentsForLinking() {
  const supabase = await createSupabaseServerClient();
  const { data: students } = await supabase
    .from("students")
    .select("id, name, auth_user_id")
    .order("name");

  return students ?? [];
}

export async function getAttendanceTrend(filters: {
  from?: string;
  to?: string;
} = {}): Promise<AttendanceTrendItem[]> {
  const supabase = await createSupabaseServerClient();
  const from = filters.from ?? getISODateNDaysAgo(14);
  let query = supabase.from("attendance").select("date, status").gte("date", from);

  if (filters.to) {
    query = query.lte("date", filters.to);
  }

  const { data } = await query;
  return buildAttendanceTrend(data ?? []);
}

export async function getStudentDashboard(userId?: string) {
  const supabase = await createSupabaseServerClient();
  let resolvedUserId = userId;
  if (!resolvedUserId) {
    const { data: authData } = await supabase.auth.getUser();
    resolvedUserId = authData.user?.id;
  }
  if (!resolvedUserId) return null;

  const { data: student } = await supabase
    .from("students")
    .select("id, name, grade_level")
    .eq("auth_user_id", resolvedUserId)
    .maybeSingle();

  if (!student) return null;

  const sinceDate = getISODateNDaysAgo(14);
  const [{ data: attendance }, { data: fees }] = await Promise.all([
    supabase
      .from("attendance")
      .select("status")
      .eq("student_id", student.id)
      .gte("date", sinceDate),
    supabase
      .from("fees")
      .select("amount, status, due_date")
      .eq("student_id", student.id)
      .order("due_date", { ascending: true }),
  ]);

  const attendanceRecords = attendance ?? [];
  const presentCount = attendanceRecords.filter(
    (record) => record.status === "Present"
  ).length;
  const attendancePercent =
    attendanceRecords.length === 0
      ? 0
      : Math.round((presentCount / attendanceRecords.length) * 100);

  const pendingFees = (fees ?? []).filter((fee) => fee.status === "Pending");
  const pendingFeesTotal = pendingFees.reduce(
    (sum, fee) => sum + Number(fee.amount ?? 0),
    0
  );
  const nextDue = pendingFees[0]?.due_date ?? null;

  return {
    student,
    attendancePercent,
    attendanceRecords: attendanceRecords.length,
    pendingFeesTotal,
    nextDue,
  };
}
