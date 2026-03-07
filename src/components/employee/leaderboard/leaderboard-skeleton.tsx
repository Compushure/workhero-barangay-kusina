function SkeletonCard({ size }: { size: 'large' | 'small' }) {
  const isLarge = size === 'large';
  return (
    <div
      className={`rounded-lg border-3 border-[#47331F] bg-[#3D2512] animate-pulse ${isLarge ? 'w-36 h-52' : 'w-24 h-36'}`}
    />
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-10 w-full">
      {/* Top 3 skeletons */}
      <div className="flex items-end justify-center gap-6">
        <SkeletonCard size="large" />
        <div className="-translate-y-8">
          <SkeletonCard size="large" />
        </div>
        <SkeletonCard size="large" />
      </div>
      {/* Rest skeletons */}
      <div className="flex flex-wrap justify-center gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonCard key={i} size="small" />
        ))}
      </div>
    </div>
  );
}
