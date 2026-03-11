import { Skeleton } from '@/components/ui/skeleton';

export function UserSkeleton() {
  return (
    <div className="bg-background-soft rounded-xl border border-border p-5 space-y-4">
      {/* Avatar skeleton */}
      <div className="flex justify-center">
        <Skeleton className="w-16 h-16 rounded-full bg-gray-300" />
      </div>

      {/* Name skeleton */}
      <Skeleton className="h-5 w-3/4 mx-auto bg-gray-300" />

      {/* Email skeleton */}
      <Skeleton className="h-4 w-2/3 mx-auto bg-gray-300" />

      {/* Badges section */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20 bg-gray-300" />
        <div className="flex gap-2 flex-wrap justify-center">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="w-10 h-10 rounded-lg bg-gray-300" />
          ))}
        </div>
      </div>

      {/* Button skeleton */}
      <Skeleton className="h-9 w-full rounded-lg bg-gray-300" />
    </div>
  );
}

export function UserGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <UserSkeleton key={i} />
      ))}
    </div>
  );
}
