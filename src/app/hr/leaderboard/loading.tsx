import { Skeleton } from '@/components/ui/skeleton';

export default function LeaderboardLoading() {
  return (
    <div className="p-4 sm:p-8 bg-[#F3F3F3] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Hall of Fame Header Skeleton */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-2">
            <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded" />
            <Skeleton className="h-9 w-64 sm:h-11 sm:w-80" />
            <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded" />
          </div>
          
          {/* Period Selector Skeleton */}
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
            <Skeleton className="h-6 w-24 sm:h-7 sm:w-32" />
            <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
          </div>
          
          <Skeleton className="h-5 w-72 sm:w-96" />
        </div>

        {/* Top 3 Podium Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 mt-12 sm:mt-16 items-end justify-items-center">
          {/* Position 1 - Larger */}
          <div className="w-full max-w-sm sm:scale-110 bg-card rounded-2xl overflow-hidden shadow-sm border border-gray-200">
            <div className="py-2 text-center mt-4 mx-auto">
              <Skeleton className="h-8 w-32 sm:w-36 rounded-lg mx-auto" />
            </div>

            <div className="pt-8 sm:pt-10 px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col items-center text-center">
              <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mb-3 sm:mb-4" />
              <Skeleton className="h-7 w-40 sm:h-8 sm:w-48 mb-3 sm:mb-4" />
              <div className="w-full border-t border-gray-200 pt-2 sm:pt-3">
                <Skeleton className="h-8 w-20 sm:h-10 sm:w-24 mx-auto mb-2" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </div>
            </div>
          </div>

          {/* Positions 2 and 3 - Regular size */}
          {[2, 3].map((pos) => (
            <div key={pos} className="w-full max-w-sm bg-card rounded-2xl overflow-hidden shadow-sm border border-gray-200">
              <div className="py-2 text-center mt-4 mx-auto">
                <Skeleton className="h-7 w-28 sm:w-32 rounded-lg mx-auto" />
              </div>

              <div className="pt-6 sm:pt-8 px-3 sm:px-4 pb-3 sm:pb-4 flex flex-col items-center text-center">
                <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mb-2 sm:mb-3" />
                <Skeleton className="h-6 w-32 sm:h-7 sm:w-40 mb-2 sm:mb-3" />
                <div className="w-full border-t border-gray-200 pt-2">
                  <Skeleton className="h-7 w-16 sm:h-8 sm:w-20 mx-auto mb-1" />
                  <Skeleton className="h-3 w-28 mx-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Remaining Players - Grid Layout Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 justify-items-center mt-8 sm:mt-10">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="shrink-0 w-40 sm:w-48 bg-card rounded-2xl overflow-hidden shadow-sm border border-gray-200"
            >
                <div className="py-2 text-center mt-3 mx-auto">
                  <Skeleton className="h-6 w-20 sm:w-24 rounded-lg mx-auto" />
                </div>

                <div className="pt-6 sm:pt-7 px-3 sm:px-4 pb-3 sm:pb-4 flex flex-col items-center text-center">
                  <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-2 sm:mb-3" />
                  <Skeleton className="h-5 w-24 sm:h-6 sm:w-32 mb-2 sm:mb-3" />
                  <div className="w-full border-t border-gray-200 pt-2">
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

