import { Skeleton } from '@/components/ui/skeleton';

export default function LeaderboardLoading() {
  return (
    <div className="p-4 sm:p-8 bg-background text-foreground min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Hall of Fame Header Skeleton */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-2">
            <Skeleton className="h-9 w-64 sm:h-11 sm:w-80" />
          </div>

          {/* Period Selector Skeleton */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
            <Skeleton className="h-6 w-24 sm:h-7 sm:w-32" />
            <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
          </div>

          <Skeleton className="h-5 w-72 sm:w-96 mt-2" />
        </div>

        {/* Top 3 Podium Skeletons - Order: 2nd, 1st, 3rd */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 mt-12 sm:mt-16 items-end justify-items-center">
          {/* Position 2 - Left (2nd Place) */}
          <div className="w-full max-w-sm bg-card rounded-2xl shadow-sm">
            <div className="px-3 sm:px-4 py-3 sm:py-4 flex flex-col items-center text-center">
              <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mb-3 sm:mb-4" />
              <Skeleton className="h-6 w-32 sm:h-7 sm:w-40 mb-3 sm:mb-4" />
              {/* Badge Skeletons */}
              <div className="flex gap-1.5 sm:gap-2 justify-center mb-3 sm:mb-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
                ))}
              </div>
              <div className="w-full border-t border-orange-200 pt-2 sm:pt-3">
                <Skeleton className="h-7 w-16 sm:h-8 sm:w-20 mx-auto mb-2" />
                <Skeleton className="h-3 w-28 mx-auto" />
              </div>
            </div>
          </div>

          {/* Position 1 - Center (1st Place) - Larger and raised */}
          <div className="w-full max-w-sm sm:scale-110 sm:-translate-y-4 bg-card rounded-2xl shadow-sm">
            <div className="px-4 sm:px-6 py-4 sm:py-6 flex flex-col items-center text-center">
              <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mb-3 sm:mb-4" />
              <Skeleton className="h-7 w-40 sm:h-8 sm:w-48 mb-3 sm:mb-4" />
              {/* Badge Skeletons */}
              <div className="flex gap-1.5 sm:gap-2 justify-center mb-3 sm:mb-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
                ))}
              </div>
              <div className="w-full border-t border-orange-200 pt-2 sm:pt-3">
                <Skeleton className="h-8 w-20 sm:h-10 sm:w-24 mx-auto mb-2" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </div>
            </div>
          </div>

          {/* Position 3 - Right (3rd Place) */}
          <div className="w-full max-w-sm bg-card rounded-2xl shadow-sm">
            <div className="px-3 sm:px-4 py-3 sm:py-4 flex flex-col items-center text-center">
              <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mb-3 sm:mb-4" />
              <Skeleton className="h-6 w-32 sm:h-7 sm:w-40 mb-3 sm:mb-4" />
              {/* Badge Skeletons */}
              <div className="flex gap-1.5 sm:gap-2 justify-center mb-3 sm:mb-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
                ))}
              </div>
              <div className="w-full border-t border-orange-200 pt-2 sm:pt-3">
                <Skeleton className="h-7 w-16 sm:h-8 sm:w-20 mx-auto mb-2" />
                <Skeleton className="h-3 w-28 mx-auto" />
              </div>
            </div>
          </div>
        </div>

        {/* Remaining Players (4-10) - Grid Layout Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 justify-items-center mt-8 sm:mt-10">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="shrink-0 w-40 sm:w-48 bg-card rounded-2xl shadow-sm">
              <div className="px-3 sm:px-4 py-3 sm:py-4 flex flex-col items-center text-center">
                <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-2 sm:mb-3" />
                <Skeleton className="h-5 w-24 sm:h-6 sm:w-32 mb-2" />
                {/* Badge Skeletons */}
                <div className="flex gap-1 justify-center mb-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />
                  ))}
                </div>
                <div className="w-full border-t border-orange-200 pt-2">
                  <Skeleton className="h-6 w-12 sm:h-7 sm:w-16 mx-auto mb-1" />
                  <Skeleton className="h-3 w-20 sm:w-24 mx-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
