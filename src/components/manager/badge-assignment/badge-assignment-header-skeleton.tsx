import { Skeleton } from '@/components/ui/skeleton';

export function BadgeAssignmentHeaderSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <section className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-3 sm:gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-56 bg-muted" />
          <Skeleton className="h-5 w-72 bg-muted" />
        </div>

        <div className="flex rounded-2xl w-full sm:w-fit h-fit border border-accent/25 overflow-hidden bg-card/75">
          <Skeleton className="h-12 w-full sm:w-40 rounded-none" />
          <Skeleton className="h-12 w-full sm:w-40 rounded-none" />
        </div>
      </section>
    </div>
  );
}
