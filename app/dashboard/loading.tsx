export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-muted rounded-md" />
          <div className="h-4 w-72 bg-muted rounded-md" />
        </div>
        <div className="h-8 w-32 bg-muted rounded-md" />
      </div>

      {/* Stats Bar Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border bg-card rounded-xl p-5 space-y-3">
            <div className="h-3.5 w-24 bg-muted rounded-sm" />
            <div className="h-8 w-16 bg-muted rounded-md" />
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-9 w-full sm:max-w-xs bg-muted rounded-md" />
        <div className="h-9 w-32 bg-muted rounded-md" />
        <div className="h-9 w-32 bg-muted rounded-md" />
        <div className="h-9 w-40 bg-muted rounded-md" />
      </div>

      {/* Table Skeleton */}
      <div className="border rounded-lg bg-card overflow-hidden">
        <div className="h-10 bg-muted/40 border-b" />
        <div className="divide-y">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 grid grid-cols-6 gap-4 items-center">
              <div className="h-4 w-20 bg-muted rounded-sm" />
              <div className="h-4 w-32 bg-muted rounded-sm col-span-2" />
              <div className="h-4 w-16 bg-muted rounded-sm" />
              <div className="h-4 w-12 bg-muted rounded-sm justify-self-center" />
              <div className="h-7 w-16 bg-muted rounded-md justify-self-end" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
