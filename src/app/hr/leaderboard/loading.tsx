import { Skeleton } from '@/components/ui/skeleton';

export default function LeaderboardLoading() {
  return (
    <div className="p-8 bg-[#F3F3F3] min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header Section Skeleton */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 1st Place Card Skeleton */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="w-full max-w-sm bg-card rounded-3xl overflow-hidden shadow-sm border border-gray-200">
              {/* Rank Badge */}
              <div className="py-2 text-center mt-4 mx-auto w-32">
                <Skeleton className="h-8 w-32 rounded-lg mx-auto" />
              </div>

              <div className="p-8 flex flex-col items-center text-center">
                {/* Profile Circle */}
                <div className="relative w-40 h-40 rounded-full border-8 border-gray-200 flex items-center justify-center bg-white mb-6">
                  <Skeleton className="w-full h-full rounded-full" />
                </div>

                {/* Stars and Name */}
                <div className="mb-8 w-full">
                  <Skeleton className="h-6 w-20 mx-auto mb-2" />
                  <Skeleton className="h-10 w-48 mx-auto" />
                </div>

                {/* Points Section */}
                <div className="w-full border-t border-orange-200 pt-4">
                  <Skeleton className="h-14 w-32 mx-auto mb-2" />
                  <Skeleton className="h-5 w-28 mx-auto" />
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable List Skeleton for 2nd - 10th */}
          <div className="lg:col-span-8">
            <div className="space-y-4">
              {Array.from({ length: 9 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  {/* Rank Number */}
                  <Skeleton className="h-6 w-12" />

                  {/* Main Row Card */}
                  <div className="flex-1 flex items-center justify-between bg-[#F9F3E9] rounded-full pr-6 pl-2 py-2 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                      {/* Avatar Circle */}
                      <Skeleton className="w-12 h-12 rounded-full" />

                      {/* Employee Name */}
                      <Skeleton className="h-5 w-32" />
                    </div>

                    {/* Points */}
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
