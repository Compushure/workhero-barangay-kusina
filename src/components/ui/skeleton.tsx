import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-muted animate-pulse rounded-md', className)}
      {...props}
    />
  );
}

interface PageLoadingSkeletonProps {
  message?: string;
  showHeader?: boolean;
  showTable?: boolean;
  showCards?: boolean;
}

function PageLoadingSkeleton({
  message = 'Loading...',
  showHeader = true,
  showTable = false,
  showCards = false,
}: PageLoadingSkeletonProps) {
  return (
    <div className="min-h-screen bg-[#fff8f5] p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header Skeleton */}
        {showHeader && (
          <div className="space-y-4">
            <div className="h-10 w-64 bg-[#ffd4b8] rounded animate-pulse" />
            <div className="h-5 w-96 bg-[#ffd4b8] rounded animate-pulse" />

            {/* Search and Filter Skeleton */}
            <div className="flex gap-4 mt-6">
              <div className="h-10 flex-1 max-w-md bg-white border border-[#ffd4b8] rounded animate-pulse" />
              <div className="h-10 w-48 bg-white border border-[#ffd4b8] rounded animate-pulse" />
            </div>
          </div>
        )}

        {/* Centered Spinner */}
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#f97316] border-t-transparent rounded-full animate-spin" />
            <span className="text-[#5a2a2a] font-medium">{message}</span>
          </div>
        </div>

        {/* Table Skeleton */}
        {showTable && (
          <div className="bg-white rounded-lg shadow-md border border-[#ffd4b8] p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 py-3 border-b border-[#ffd4b8] last:border-0"
                >
                  <div className="h-5 w-32 bg-[#ffd4b8] rounded animate-pulse" />
                  <div className="h-5 flex-1 bg-[#ffd4b8] rounded animate-pulse" />
                  <div className="h-5 w-24 bg-[#ffd4b8] rounded animate-pulse" />
                  <div className="h-8 w-20 bg-[#ffd4b8] rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cards Grid Skeleton */}
        {showCards && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-white border border-[#ffd4b8] rounded-lg p-6">
                <div className="space-y-3">
                  <div className="h-4 w-24 bg-[#ffd4b8] rounded animate-pulse" />
                  <div className="h-8 w-16 bg-[#ffd4b8] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FullPageLoadingSkeleton({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex min-h-screen bg-[#fff8f5]">
      {/* Sidebar Skeleton */}
      <div className="w-64 border-r border-[#ffd4b8] bg-white">
        <div className="p-6 space-y-6">
          <div className="h-8 w-32 bg-[#ffd4b8] rounded animate-pulse" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-[#ffd4b8] rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 p-8">
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#f97316] border-t-transparent rounded-full animate-spin" />
            <span className="text-[#5a2a2a] font-medium text-lg">{message}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Skeleton, PageLoadingSkeleton, FullPageLoadingSkeleton };
