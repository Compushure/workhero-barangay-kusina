function SkeletonCard({ size }: { size: 'large' | 'small' }) {
  const isLarge = size === 'large';
  return (
    <div
      className={`animate-pulse rounded-lg border-3 border-[#47331F] bg-[#3D2512] ${isLarge ? 'h-44 w-40 sm:h-48 sm:w-44 md:h-52 md:w-52' : 'h-32 w-24 sm:h-36 sm:w-28 md:h-36 md:w-32 lg:w-36'}`}
    />
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="flex w-full flex-col items-center gap-6 sm:gap-8 md:gap-10">
      {/* Top 3 skeletons */}
      <div className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row sm:items-end sm:gap-5 md:gap-6">
        <SkeletonCard size="large" />
        <div className="sm:-translate-y-6 md:-translate-y-8">
          <SkeletonCard size="large" />
        </div>
        <SkeletonCard size="large" />
      </div>
      {/* Rest skeletons */}
      <div className="flex w-full flex-wrap justify-center gap-2.5 sm:gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonCard key={i} size="small" />
        ))}
      </div>
    </div>
  );
}
