import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SkeletonCard() {
  return (
    <Card className="w-full rounded-lg bg-card p-2 sm:p-3 md:p-4 shadow-sm/25 mb-3 sm:mb-4">
      <div className="flex flex-col gap-3 sm:gap-4 md:gap-5">
        {/* Main content area */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-2 sm:gap-3 flex-1">
          <div className="space-y-2 w-full lg:w-2/3">
            {/* Title and description */}
            <div className="flex flex-col sm:flex-row gap-1 sm:items-end">
              <Skeleton className="h-6 w-full sm:w-2/3 bg-background" />
              <Skeleton className="h-4 w-full sm:w-1/2 bg-background" />
            </div>

            {/* Date badge */}
            <Skeleton className="h-6 w-44 sm:w-52 bg-background rounded-md" />
          </div>

          {/* Points/XP section */}
          <div className="flex gap-2 sm:gap-3">
            <Skeleton className="h-10 w-24 sm:w-28 bg-background" />
            <Skeleton className="h-10 w-20 sm:w-24 bg-background" />
          </div>
        </div>

        {/* Employee badges */}
        <div className="flex flex-col gap-2 lg:w-80">
          <Skeleton className="h-5 w-28 sm:w-32 bg-background" />
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-5 w-24 sm:w-28 bg-background rounded-lg" />
            <Skeleton className="h-5 w-28 sm:w-32 bg-background rounded-lg" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function SkeletonRow() {
  return (
    <Card className="w-full py-4 rounded-none bg-background-soft">
      <CardContent>
        <Skeleton className="w-full h-8 bg-gray-300" />
      </CardContent>
    </Card>
  );
}
