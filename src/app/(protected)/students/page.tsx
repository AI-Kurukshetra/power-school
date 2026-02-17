import type { Metadata } from "next";
import { Suspense } from "react";
import { StudentsContent } from "./StudentsContent";
import { StudentsSkeleton } from "./StudentsSkeleton";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Students | Bac PowerSchool",
    description: "Manage students, attendance, and access links.",
  };
}

export default function StudentsPage() {
  return (
    <Suspense fallback={<StudentsSkeleton />}>
      <StudentsContent />
    </Suspense>
  );
}
