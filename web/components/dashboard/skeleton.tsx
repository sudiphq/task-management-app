import { Skeleton } from "../ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-20" />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Skeleton className="h-9 flex-1" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid gap-2 lg:grid-cols-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-md" />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <div className="flex gap-1">
            <Skeleton className="size-6 rounded-md" />
            <Skeleton className="size-6 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-border sticky top-0 bg-background z-10">
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-20" />
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <DashboardSkeleton />
      </main>
    </div>
  );
}
