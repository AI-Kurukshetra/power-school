import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();

function loadEnvFile(filename) {
  const envPath = path.join(ROOT, filename);
  if (!fs.existsSync(envPath)) return;
  const contents = fs.readFileSync(envPath, "utf8");
  contents.split(/\r?\n/).forEach((line) => {
    if (!line || line.trim().startsWith("#")) return;
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!match) return;
    const key = match[1];
    let value = match[2] ?? "";
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local."
  );
  console.error(
    "Add SUPABASE_SERVICE_ROLE_KEY to seed data, then run: node scripts/seed.mjs --reset"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const TOTAL_STUDENTS = 100;
const TOTAL_ATTENDANCE = 500;
const TOTAL_FEES = 100;
const ATTENDANCE_DAYS_WINDOW = 30;

const RESET = process.argv.includes("--reset");

const firstNames = [
  "Ava",
  "Liam",
  "Noah",
  "Sophia",
  "Maya",
  "Elijah",
  "Lucas",
  "Amelia",
  "Mason",
  "Harper",
  "Evelyn",
  "Logan",
  "James",
  "Aria",
  "Henry",
  "Nora",
  "Hazel",
  "Ella",
  "Levi",
  "Zoey",
];

const lastNames = [
  "Rivera",
  "Thompson",
  "Nguyen",
  "Patel",
  "Carter",
  "Brooks",
  "Hughes",
  "Mitchell",
  "Ortiz",
  "Singh",
  "Rogers",
  "Bennett",
  "Reed",
  "Hernandez",
  "Kim",
  "Howard",
  "Lee",
  "Diaz",
  "Gray",
  "Morgan",
];

const gradeLevels = [
  "K",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
].map((level) => (level === "K" ? "K" : `Grade ${level}`));

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function weightedStatus() {
  const roll = Math.random();
  if (roll < 0.8) return "Present";
  if (roll < 0.95) return "Absent";
  return "Tardy";
}

async function insertInBatches(table, rows, selectColumns = "id", size = 200) {
  const inserted = [];
  for (let i = 0; i < rows.length; i += size) {
    const batch = rows.slice(i, i + size);
    const { data, error } = await supabase
      .from(table)
      .insert(batch)
      .select(selectColumns);
    if (error) throw error;
    inserted.push(...(data ?? []));
  }
  return inserted;
}

async function deleteAll(table) {
  const { error } = await supabase
    .from(table)
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) throw error;
}

async function run() {
  if (RESET) {
    console.log("Resetting tables...");
    await deleteAll("attendance");
    await deleteAll("fees");
    await deleteAll("students");
  }

  console.log("Seeding students...");
  const students = Array.from({ length: TOTAL_STUDENTS }, (_, index) => {
    const first = randomItem(firstNames);
    const last = randomItem(lastNames);
    const grade = randomItem(gradeLevels);
    return {
      name: `${first} ${last}`,
      grade_level: grade,
      parent_contact: `parent${index + 1}@demo-school.org`,
    };
  });

  const insertedStudents = await insertInBatches("students", students, "id");
  const studentIds = insertedStudents.map((student) => student.id);

  if (studentIds.length === 0) {
    throw new Error("No students inserted. Check Supabase permissions.");
  }

  console.log("Seeding attendance...");
  const today = new Date();
  const attendanceRows = [];
  const attendanceKeys = new Set();

  while (attendanceRows.length < TOTAL_ATTENDANCE) {
    const offset = randomInt(0, ATTENDANCE_DAYS_WINDOW - 1);
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const dateString = formatDate(date);
    const studentId = randomItem(studentIds);
    const key = `${studentId}-${dateString}`;
    if (attendanceKeys.has(key)) continue;
    attendanceKeys.add(key);
    attendanceRows.push({
      student_id: studentId,
      date: dateString,
      status: weightedStatus(),
    });
  }

  await insertInBatches("attendance", attendanceRows, "id");

  console.log("Seeding fees...");
  const fees = Array.from({ length: TOTAL_FEES }, () => {
    const studentId = randomItem(studentIds);
    const status = Math.random() < 0.6 ? "Paid" : "Pending";
    const amount = randomInt(80, 1200);
    const date = new Date(today);
    if (status === "Pending") {
      date.setDate(today.getDate() + randomInt(5, 45));
    } else {
      date.setDate(today.getDate() - randomInt(5, 120));
    }
    return {
      student_id: studentId,
      amount,
      status,
      due_date: formatDate(date),
    };
  });

  await insertInBatches("fees", fees, "id");

  console.log("Seed complete.");
  console.log(`Students: ${TOTAL_STUDENTS}`);
  console.log(`Attendance records: ${TOTAL_ATTENDANCE}`);
  console.log(`Fee records: ${TOTAL_FEES}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
