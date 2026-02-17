import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardContent } from "./DashboardContent";
import { DashboardSkeleton } from "./DashboardSkeleton";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Dashboard | Bac PowerSchool",
    description: "Enrollment, attendance, and fee tracking in one view.",
  };
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
