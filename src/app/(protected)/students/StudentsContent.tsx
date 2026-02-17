import { SectionHeader } from "@/components/SectionHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { getUserRole } from "@/lib/auth";
import { getTodayISODate } from "@/lib/date";
import { getStudentsForLinking, getStudentsWithAttendance } from "@/lib/data";
import { AttendanceForm } from "./AttendanceForm";
import { LinkStudentForm } from "./LinkStudentForm";
import { StudentForm } from "./StudentForm";

export async function StudentsContent() {
  const role = await getUserRole();
  const [students, linkableStudents] = await Promise.all([
    getStudentsWithAttendance(),
    role === "Admin" ? getStudentsForLinking() : Promise.resolve([]),
  ]);
  const today = getTodayISODate();
  const canManageStudents = role === "Admin";
  const canMarkAttendance = role === "Admin" || role === "Teacher";

  return (
    <section className="space-y-8">
      <SectionHeader
        title="Student List"
        subtitle="Add new students, then mark attendance for today."
      />

      {canManageStudents ? (
        <>
          <div className="surface rounded-xl p-6">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                New Student
              </p>
              <h3 className="mt-2 text-xl font-semibold text-foreground">
                Enrollment entry
              </h3>
            </div>
            <StudentForm />
          </div>
          <div className="surface rounded-xl p-6">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Student Access
              </p>
              <h3 className="mt-2 text-xl font-semibold text-foreground">
                Link student profiles
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Connect a student record with their Supabase auth user id.
              </p>
            </div>
            <LinkStudentForm students={linkableStudents} />
          </div>
        </>
      ) : (
        <div className="surface rounded-xl p-6 text-sm text-slate-600">
          Student enrollment is managed by Admins.
        </div>
      )}

      <div className="surface overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Grade Level</th>
                <th className="px-6 py-4">Parent Contact</th>
                <th className="px-6 py-4">Today</th>
                <th className="px-6 py-4">Mark Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {students.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-slate-600" colSpan={5}>
                    No students found yet. Add a student using the form above.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-foreground">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {student.grade_level}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {student.parent_contact ?? "-"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge label={student.todayStatus} />
                    </td>
                    <td className="px-6 py-4">
                      {canMarkAttendance ? (
                        <AttendanceForm
                          studentId={student.id}
                          date={today}
                          defaultStatus={
                            student.todayStatus === "Not marked"
                              ? "Present"
                              : student.todayStatus
                          }
                        />
                      ) : (
                        <span className="text-xs text-slate-500">
                          Read-only access
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
