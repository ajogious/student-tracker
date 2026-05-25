export default function StudentProfileLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Breadcrumb & Actions Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="h-4 w-48 bg-muted rounded-md" />
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-muted rounded-md" />
          <div className="h-8 w-24 bg-muted rounded-md" />
        </div>
      </div>

      {/* Header Card Skeleton */}
      <div className="border bg-card rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <div className="h-8 w-64 bg-muted rounded-md" />
            <div className="h-6 w-20 bg-muted rounded-full" />
          </div>
          <div className="flex gap-4">
            <div className="h-4 w-32 bg-muted rounded-sm" />
            <div className="h-4 w-40 bg-muted rounded-sm" />
          </div>
        </div>
        <div className="h-9 w-32 bg-muted rounded-md" />
      </div>

      {/* Two Column Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Exams Skeleton */}
          <div className="border bg-card rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-5 w-32 bg-muted rounded-sm" />
              <div className="h-7 w-20 bg-muted rounded-md" />
            </div>
            <div className="border rounded-lg p-3 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div className="h-4 w-40 bg-muted rounded-sm" />
                  <div className="h-4 w-12 bg-muted rounded-full" />
                  <div className="h-3 w-20 bg-muted rounded-sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Projects Skeleton */}
          <div className="border bg-card rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-5 w-32 bg-muted rounded-sm" />
              <div className="h-7 w-20 bg-muted rounded-md" />
            </div>
            <div className="border rounded-lg p-3 space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div className="h-4 w-36 bg-muted rounded-sm" />
                  <div className="h-4 w-16 bg-muted rounded-sm" />
                  <div className="h-3 w-20 bg-muted rounded-sm" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Personal Info Skeleton */}
          <div className="border bg-card rounded-xl p-5 space-y-4">
            <div className="h-5 w-32 bg-muted rounded-sm border-b pb-2" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center pb-2 border-b last:border-0 last:pb-0">
                <div className="h-4 w-20 bg-muted rounded-sm" />
                <div className="h-4 w-24 bg-muted rounded-sm" />
              </div>
            ))}
          </div>

          {/* Sponsor Info Skeleton */}
          <div className="border bg-card rounded-xl p-5 space-y-4">
            <div className="h-5 w-32 bg-muted rounded-sm border-b pb-2" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="size-8 bg-muted rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 w-16 bg-muted rounded-sm" />
                  <div className="h-4 w-32 bg-muted rounded-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
