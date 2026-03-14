export function BadgeAssignmentUsersSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="h-8 w-36 rounded-full bg-muted" />
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center w-full sm:w-auto">
          <div className="h-10 w-full sm:w-64 rounded-full bg-muted" />
          <div className="h-10 w-full sm:w-40 rounded-md bg-muted" />
        </div>
      </div>

      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-background-soft rounded-xl border border-accent/25 p-4 shadow-sm/25"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="shrink-0 flex items-center gap-3 min-w-0 sm:min-w-48">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted" />
                <div className="min-w-0 flex-1 sm:w-48 space-y-2">
                  <div className="h-4 w-30 rounded bg-muted" />
                  <div className="h-3 w-22 rounded bg-muted" />
                </div>
              </div>

              <div className="flex-1 flex items-center gap-2 flex-wrap px-0 sm:px-4 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-muted" />
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-muted" />
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-muted" />
                <div className="h-10 sm:h-12 w-10 rounded-md bg-muted" />
              </div>

              <div className="h-10 w-full sm:w-30 rounded-md bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BadgeAssignmentQuickSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-4">
        <div className="flex items-center">
          <div className="h-8 w-44 rounded-full bg-muted" />
        </div>
        <div className="h-10 w-40 rounded-md bg-muted" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="space-y-2">
            <div className="h-6 w-28 rounded bg-muted" />
            <div className="h-9 w-full rounded-md bg-muted" />
          </div>

          <div className="space-y-3">
            <div className="border border-accent/25 rounded-lg overflow-hidden h-96 shadow-sm/25">
              <div className="divide-y divide-accent/25">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="w-full px-4 py-3 bg-background-soft">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted shrink-0" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="h-4 w-24 rounded bg-muted" />
                        <div className="h-3 w-12 rounded bg-muted" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-1">
              <div className="h-8 w-10 rounded-md bg-muted" />
              <div className="h-8 w-8 rounded-md bg-muted" />
              <div className="h-8 w-8 rounded-md bg-muted" />
              <div className="h-8 w-10 rounded-md bg-muted" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-background-soft border border-dashed border-accent/25 rounded-lg p-12 text-center">
            <div className="h-6 w-56 mx-auto rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
