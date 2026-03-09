export function BadgeAssignmentUsersSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-card rounded-xl border border-accent/25 p-4 shadow-sm/25 animate-pulse"
        >
          {/* Avatar skeleton */}
          <div className="flex items-center gap-3 mb-3">
            <div className="size-12 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
          
          {/* Badges skeleton */}
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded w-1/3" />
            <div className="flex flex-wrap gap-1">
              <div className="h-6 w-16 bg-muted rounded-full" />
              <div className="h-6 w-20 bg-muted rounded-full" />
              <div className="h-6 w-14 bg-muted rounded-full" />
            </div>
          </div>
          
          {/* Button skeleton */}
          <div className="mt-4 h-9 bg-muted rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function BadgeAssignmentQuickSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="bg-card rounded-xl border border-accent/25 p-4 shadow-sm/25 animate-pulse"
        >
          {/* Badge icon skeleton */}
          <div className="flex justify-center mb-3">
            <div className="size-16 rounded-full bg-muted" />
          </div>
          
          {/* Badge name */}
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-3/4 mx-auto" />
          </div>
          
          {/* Button skeleton */}
          <div className="h-9 bg-muted rounded-full" />
        </div>
      ))}
    </div>
  );
}
