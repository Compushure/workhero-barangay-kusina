import { Skeleton } from '@/components/ui/skeleton';

export default function LeaderboardLoading() {
  return (
    <div className="p-4 sm:p-8 bg-[#F3F3F3] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl shrink-0" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-44" />
              <Skeleton className="h-4 w-80" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 sm:gap-4">
            <Skeleton className="h-10 w-40 rounded-md" />
            <Skeleton className="h-10 w-44 rounded-md" />
          </div>
        </div>

        {/* Ranking card skeletons */}
        <div className="space-y-3 max-w-5xl mx-auto">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between px-4 sm:px-6 py-6 sm:py-8">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Skeleton className="w-11 h-11 rounded-full shrink-0" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Skeleton className="h-5 w-28" />
                      <Skeleton className="h-5 w-36 rounded-full" />
                      {i === 0 && <Skeleton className="h-5 w-14 rounded-full" />}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Skeleton className="h-5 w-40 rounded-full" />
                      <Skeleton className="h-5 w-48 rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:block h-9 w-px bg-gray-200 mr-5" />
                  <Skeleton className="hidden sm:block w-4 h-4 rounded-sm" />
                  <Skeleton className="w-10 h-6 rounded-full" />
                  <Skeleton className="hidden sm:block h-4 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
