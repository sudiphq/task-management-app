import { Suspense } from "react";
import { Dashboard } from "@/components/dashboard/dashboard-content";
import { DashboardPageSkeleton } from "@/components/dashboard/skeleton";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}
