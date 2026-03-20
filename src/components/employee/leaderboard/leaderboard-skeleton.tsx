type LeaderboardSkeletonProps = {
  variant?: 'current' | 'history';
};

function PeriodNavSkeleton() {
  return (
    <div className="flex w-full max-w-[320px] items-center justify-center gap-2 rounded-2xl border border-[#8A6342] bg-[#5A412C]/95 px-2.5 py-2 shadow-[2px_2px_0_rgba(0,0,0,0.35)] sm:max-w-none sm:gap-3 sm:px-4" aria-hidden>
      <div className="h-9 w-9 shrink-0 animate-pulse rounded-xl bg-[#b07440]/70 shadow-[2px_2px_0_rgba(0,0,0,0.4)] sm:h-10 sm:w-10" />
      <div className="flex min-w-0 flex-1 flex-col items-center rounded-xl border border-[#6C4B30] bg-[#3D2512]/75 px-3 py-2 sm:min-w-[150px] sm:px-4">
        <div className="h-2 w-14 animate-pulse rounded bg-[#F4B925]/20 sm:w-16" />
        <div className="mt-1 h-5 w-20 animate-pulse rounded bg-[#F4B925]/35 sm:h-6 sm:w-28" />
      </div>
      <div className="h-9 w-9 shrink-0 animate-pulse rounded-xl bg-[#b07440]/70 shadow-[-2px_2px_0_rgba(0,0,0,0.4)] sm:h-10 sm:w-10" />
    </div>
  );
}

function SkeletonCard({ size }: { size: 'large' | 'small' }) {
  const isLarge = size === 'large';
  return (
    <div
      className={[
        'relative flex w-full shrink-0 flex-col items-center rounded-lg border-3 border-[#47331F] bg-[#3D2512] shadow-lg animate-pulse',
        isLarge
          ? 'max-w-66 p-3 pt-6 sm:w-40 sm:min-w-40 sm:max-w-40 sm:p-3 sm:pt-6 md:w-48 md:min-w-48 md:max-w-48 md:p-4 md:pt-7 lg:w-56 lg:min-w-56 lg:max-w-56'
          : 'max-w-none p-3 pt-6',
      ].join(' ')}
      aria-hidden
    >
      <div
        className={[
          'absolute left-1/2 z-10 -translate-x-1/2 rounded-full border-2 border-[#47331F] bg-[#F4B925]/70 shadow-md',
          isLarge
            ? '-top-5 h-12 w-12 sm:-top-6 sm:h-14 sm:w-14'
            : '-top-4 h-10 w-10 sm:-top-5 sm:h-11 sm:w-11',
        ].join(' ')}
      />

      <div className="absolute -top-2 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full border border-[#47331F] bg-[#47331F]" />

      <div
        className={[
          'flex w-full min-w-0 flex-col items-center gap-3 rounded border border-[#47331F] bg-[#F5E8D6]',
          isLarge ? 'p-3 sm:p-3 md:p-4' : 'p-3',
        ].join(' ')}
      >
        <div
          className={[
            'shrink-0 rounded-full border-2 border-[#47331F] bg-[#E89C30]/80',
            isLarge ? 'h-14 w-14 sm:h-14 sm:w-14 md:h-15 md:w-15' : 'h-12 w-12 sm:h-14 sm:w-14',
          ].join(' ')}
        />

        <div className={isLarge ? 'h-5 w-5/6 rounded bg-[#3D2512]/20' : 'h-4 w-5/6 rounded bg-[#3D2512]/20'} />

        <div className="flex flex-col items-center gap-1">
          <div className="h-6 w-16 rounded border border-[#47331F] bg-[#F4B925]/80" />
          <div className="h-2.5 w-20 rounded bg-[#3D2512]/20" />
        </div>
      </div>
    </div>
  );
}

export function LeaderboardSkeleton({ variant = 'current' }: LeaderboardSkeletonProps) {
  return (
    <div className="flex w-full max-w-7xl flex-1 flex-col items-center">
      <header className="flex w-full max-w-4xl shrink-0 flex-col items-center min-h-40 sm:min-h-44 md:min-h-56">
        {variant === 'current' && (
          <div className="mb-4 sm:mb-6">
            <PeriodNavSkeleton />
          </div>
        )}

        <div className="flex min-h-18 w-full flex-col items-center justify-start sm:min-h-20 md:min-h-22">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-[#F4B925]/30 sm:h-10 sm:w-64 md:h-12 md:w-96" aria-hidden />
          <div className="mt-2 h-5 w-40 animate-pulse rounded bg-white/25 sm:w-48 md:h-7 md:w-60" aria-hidden />
        </div>
      </header>

      <div className="flex w-full max-w-7xl flex-1 flex-col items-center pt-3 sm:pt-4">
        <section className="w-full md:hidden" aria-hidden>
          <div className="rounded-2xl border-2 border-[#47331F] bg-[#3D2512]/75 px-2 py-3 shadow-xl">
            <div className="grid grid-cols-2 gap-2.5 pt-4">
              <SkeletonCard size="small" />
              <SkeletonCard size="small" />
            </div>

            <div className="mt-3 flex items-center justify-between px-1">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-[#b07440]/70" />
              <div className="h-4 w-14 animate-pulse rounded bg-[#F4B925]/40" />
              <div className="h-10 w-10 animate-pulse rounded-lg bg-[#b07440]/70" />
            </div>
          </div>
        </section>

        <div className="hidden w-full flex-col items-center gap-6 md:flex md:gap-8" aria-hidden>
          <div className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row sm:items-end sm:justify-center sm:gap-5 md:gap-6">
            <SkeletonCard size="large" />
            <div className="sm:-translate-y-6 md:-translate-y-8">
              <SkeletonCard size="large" />
            </div>
            <SkeletonCard size="large" />
          </div>

          <div className="w-full rounded-2xl border-2 border-[#47331F] bg-[#3D2512]/75 px-3 py-4 shadow-xl sm:px-4 sm:py-5 md:px-6">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:gap-3.5 lg:grid-cols-7 lg:gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <SkeletonCard key={i} size="small" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
