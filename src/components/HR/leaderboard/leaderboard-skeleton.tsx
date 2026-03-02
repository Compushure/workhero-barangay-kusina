import { Skeleton } from '@/components/ui/skeleton';

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-3 max-w-5xl mx-auto">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 py-6 sm:py-8">
            {/* Left: medal circle + content */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Medal circle */}
              <Skeleton className="w-11 h-11 rounded-full shrink-0" />

              <div className="min-w-0 flex-1 space-y-2">
                {/* Row 1: period label + date-range pill + Latest pill (first card only) */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-5 w-36 rounded-full" />
                  {i === 0 && <Skeleton className="h-5 w-14 rounded-full" />}
                </div>
                {/* Row 2: generated pill + top-performer pill */}
                <div className="flex items-center gap-3 flex-wrap">
                  <Skeleton className="h-5 w-40 rounded-full" />
                  <Skeleton className="h-5 w-48 rounded-full" />
                </div>
              </div>
            </div>

            {/* Right: divider + eye icon + toggle + Visible label */}
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
  );
}
