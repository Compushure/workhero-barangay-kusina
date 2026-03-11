import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SkeletonCard() {
  return (
    <Card className="w-full bg-card p-2 sm:p-3 md:p-4 shadow-sm/25 mb-4">
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-5">
        {/* Main content area */}
        <div className="flex flex-col gap-2 sm:gap-3 flex-1">
          {/* Title and description */}
          <div className="flex flex-col gap-1">
            <Skeleton className="h-5 sm:h-6 w-2/3 bg-muted" />
            <Skeleton className="h-3 sm:h-4 w-1/2 bg-muted" />
          </div>

          {/* Date badge */}
          <Skeleton className="h-5 sm:h-6 w-48 bg-muted rounded-full" />

          {/* Points/XP section */}
          <div className="flex gap-2 sm:gap-3">
            <Skeleton className="h-8 sm:h-10 w-24 bg-muted" />
            <Skeleton className="h-8 sm:h-10 w-20 bg-muted" />
          </div>
        </div>

        {/* Employee badges */}
        <div className="flex flex-col gap-2 lg:w-80">
          <Skeleton className="h-5 w-32 bg-muted" />
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-8 w-28 bg-muted rounded-lg" />
            <Skeleton className="h-8 w-32 bg-muted rounded-lg" />
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
        <Skeleton className="w-full h-8 bg-muted" />
      </CardContent>
    </Card>
  );
}
