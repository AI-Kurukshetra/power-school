import { NextRequest } from "next/server";
import { getUserRole } from "@/lib/auth";
import { toCsv } from "@/lib/csv";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const role = await getUserRole();
  if (role !== "Admin" && role !== "Teacher") {
    return new Response("Forbidden", { status: 403 });
  }

  const supabase = createSupabaseServerClient();
  const params = request.nextUrl.searchParams;
  const feeStatus = params.get("feeStatus");
  const from = params.get("from");
  const to = params.get("to");

  let query = supabase
    .from("fees")
    .select("amount, status, due_date, students(name, grade_level)");

  if (feeStatus === "Paid" || feeStatus === "Pending") {
    query = query.eq("status", feeStatus);
  }
  if (from) query = query.gte("due_date", from);
  if (to) query = query.lte("due_date", to);

  const { data, error } = await query.order("due_date", { ascending: true });
  if (error) {
    return new Response("Failed to export fees.", { status: 500 });
  }

  const rows = (data ?? []).map((fee) => [
    fee.students?.name ?? "Unknown",
    fee.students?.grade_level ?? "—",
    fee.amount,
    fee.status,
    fee.due_date,
  ]);

  const csv = toCsv(
    ["Student", "Grade Level", "Amount", "Status", "Due Date"],
    rows
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="fees.csv"',
    },
  });
}
