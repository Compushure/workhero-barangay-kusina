export function BadgeAssignmentUsersSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-card rounded-lg border-b border-gray-300 p-3 shadow-sm/25">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            {/* Avatar and User Info Section */}
            <div className="shrink-0 flex items-center gap-3 min-w-0 sm:min-w-48">
              {/* Avatar skeleton */}
              <div className="size-8 sm:size-10 rounded-full bg-gray-300 animate-pulse" />

              {/* User Details */}
              <div className="min-w-0 flex-1 sm:w-48 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-gray-300 rounded w-1/2 animate-pulse" />
              </div>
            </div>

            {/* Badges Section */}
            <div className="flex-1 flex items-center gap-2 px-0 sm:px-3 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <div className="size-8 sm:size-10 rounded-lg bg-gray-300 animate-pulse" />
                <div className="size-8 sm:size-10 rounded-lg bg-gray-300 animate-pulse" />
                <div className="size-8 sm:size-10 rounded-lg bg-gray-300 animate-pulse" />
              </div>
            </div>

            {/* Button Section */}
            <div className="shrink-0 flex gap-2 sm:w-auto w-full">
              <div className="control-skeleton-h bg-gray-300 rounded-md flex-1 w-20 sm:w-24 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function BadgeAssignmentQuickSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Badges List - Left Side (1 column) */}
      <div className="lg:col-span-1 space-y-4">
        <div className="space-y-2">
          <div className="h-7 bg-gray-300 rounded-md w-32 animate-pulse" />
          <div className="control-skeleton-h bg-gray-300 rounded-md animate-pulse" />
        </div>

        {/* Badge List */}
        <div className="border border-accent/25 rounded-lg overflow-hidden shadow-sm/25">
          <div className="divide-y divide-accent/25">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-card px-3 sm:px-4 py-3">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="size-8 sm:size-10 rounded-lg bg-gray-300 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-gray-300 rounded w-12 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Badge Details and User Assignment - Right Side (2 columns) */}
      <div className="lg:col-span-2 space-y-4">
        {/* Selected Badge Details */}
        <div className="bg-card border border-accent/25 rounded-lg p-4 sm:p-6 shadow-sm/25">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="size-16 sm:size-20 rounded-lg bg-gray-300 animate-pulse shrink-0" />
            <div className="flex-1 space-y-3 min-w-0">
              <div className="h-6 bg-gray-300 rounded w-2/3 animate-pulse" />
              <div className="h-4 bg-gray-300 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-300 rounded w-24 animate-pulse" />
            </div>
          </div>
        </div>

        {/* User Selection Area */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="control-skeleton-h bg-gray-300 rounded-md flex-1 animate-pulse" />
            <div className="control-skeleton-h bg-gray-300 rounded-md w-full sm:w-44 animate-pulse" />
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card border border-accent/25 rounded-lg p-3 shadow-sm/25">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="size-8 sm:size-10 rounded-full bg-gray-300 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="h-4 bg-gray-300 rounded w-full animate-pulse" />
                    <div className="h-3 bg-gray-300 rounded w-2/3 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
