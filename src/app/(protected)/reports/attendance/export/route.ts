import { NextRequest } from "next/server";
import { getUserRole } from "@/lib/auth";
import { toCsv } from "@/lib/csv";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const role = await getUserRole();
  if (role !== "Admin" && role !== "Teacher") {
    return new Response("Forbidden", { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  const params = request.nextUrl.searchParams;
  const from = params.get("from");
  const to = params.get("to");

  let query = supabase
    .from("attendance")
    .select("date, status, students(name, grade_level)");

  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);

  const { data, error } = await query.order("date", { ascending: true });
  if (error) {
    return new Response("Failed to export attendance.", { status: 500 });
  }

  const rows = (data ?? []).map((record) => {
    const student = Array.isArray(record.students)
      ? record.students[0]
      : record.students;

    return [
      student?.name ?? "Unknown",
      student?.grade_level ?? "-",
      record.date,
      record.status,
    ];
  });

  const csv = toCsv(["Student", "Grade Level", "Date", "Status"], rows);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="attendance.csv"',
    },
  });
}
