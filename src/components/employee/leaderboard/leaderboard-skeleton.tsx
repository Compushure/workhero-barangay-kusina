type LeaderboardSkeletonProps = {
  variant?: 'current' | 'history';
};

function ToggleSkeleton() {
  return (
    <div
      className="w-full max-w-[420px] rounded-[24px] border-[3px] border-[#4A2E1C] bg-[linear-gradient(180deg,#7A502E_0%,#5E3C22_100%)] p-2.5 shadow-[0_10px_0_#2F1A0D,0_16px_28px_rgba(0,0,0,0.35)]"
      aria-hidden
    >
      <div className="flex rounded-[18px] border-[2px] border-[#3B2415] bg-[#4D2E19] p-1.5 shadow-[inset_0_2px_0_rgba(255,255,255,0.12)]">
        <div className="h-12 flex-1 animate-pulse rounded-[14px] bg-[#E1A22D]/35" />
        <div className="mx-1.5 h-12 flex-1 animate-pulse rounded-[14px] bg-[#E1A22D]/70 shadow-[inset_0_3px_0_rgba(255,255,255,0.18)]" />
      </div>
    </div>
  );
}

function PeriodNavSkeleton() {
  return (
    <div
      className="inline-flex w-full max-w-[248px] items-center justify-center gap-3 sm:max-w-[272px] sm:gap-4"
      aria-hidden
    >
      <div className="h-10 w-10 shrink-0 animate-pulse rounded-sm border-[3px] border-[#47331F] bg-[#6F4A2B]/80 shadow-[4px_4px_0px_#000] shadow-[#3017008e] sm:h-11 sm:w-11" />
      <div className="h-6 w-24 animate-pulse rounded bg-[#F4B925]/35 sm:h-7 sm:w-28" />
      <div className="h-10 w-10 shrink-0 animate-pulse rounded-sm border-[3px] border-[#47331F] bg-[#6F4A2B]/80 shadow-[4px_4px_0px_#000] shadow-[#3017008e] sm:h-11 sm:w-11" />
    </div>
  );
}

function SkeletonCard({ size }: { size: 'large' | 'small' }) {
  const isLarge = size === 'large';
  return (
    <div
      className={[
        'relative flex w-full shrink-0 flex-col items-center border-[4px] border-[#6A4527] bg-[#5B3A20] shadow-[0_8px_0_rgba(45,24,13,0.85),0_16px_24px_rgba(0,0,0,0.3)] animate-pulse',
        isLarge
          ? 'max-w-52 p-2 pt-4 sm:w-32 sm:min-w-32 sm:max-w-32 sm:p-2.5 sm:pt-4 md:w-36 md:min-w-36 md:max-w-36 md:p-3 md:pt-4.5 lg:w-40 lg:min-w-40 lg:max-w-40'
          : 'max-w-none min-w-0 p-1 pt-3.5 sm:p-2 sm:pt-3.5',
      ].join(' ')}
      aria-hidden
    >
      <div
        className={[
          'absolute left-1/2 top-0 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-[#5C3A1E] bg-[#B6884F] shadow-[0_4px_0_rgba(70,38,19,0.8),0_6px_12px_rgba(0,0,0,0.25)]',
          isLarge
            ? 'h-11 w-11 sm:h-12 sm:w-12'
            : 'h-10 w-10 sm:h-[2.625rem] sm:w-[2.625rem]',
        ].join(' ')}
      >
        <div className={isLarge ? 'h-[1.125rem] w-[1.125rem] rounded bg-[#3D2512]/35' : 'h-4 w-4 rounded bg-[#3D2512]/35'} />
      </div>

      <div className="absolute left-1/2 top-[-2.4rem] h-9 w-[2px] -translate-x-1/2 bg-[#BCA180]/80 sm:h-10" />
      <div className="absolute left-1/2 top-[-3rem] h-[1.125rem] w-[1.125rem] -translate-x-1/2 rounded-full border-2 border-[#8E6A44] bg-[#E7C79F] shadow-[0_2px_6px_rgba(0,0,0,0.35)] sm:top-[-3.15rem]" />

      <div
        className={[
          'flex w-full min-w-0 flex-col items-center border-[2px] border-[#D8BE98] bg-[linear-gradient(180deg,#F5E8D6_0%,#EBD8BA_100%)]',
          isLarge
            ? 'min-h-[150px] p-2.5 sm:min-h-[162px] sm:p-2.5 md:min-h-[178px] md:p-3'
            : 'min-h-[116px] p-1.5 sm:min-h-[132px] sm:p-2.5',
        ].join(' ')}
      >
        <div
          className={[
            'shrink-0 border-2 border-[#E7D7BF] bg-[#E89C30]/80 shadow-[0_6px_12px_rgba(232,156,48,0.18)]',
            isLarge ? 'h-12 w-12 sm:h-12 sm:w-12 md:h-14 md:w-14' : 'h-11 w-11 sm:h-12 sm:w-12',
          ].join(' ')}
        />

        <div className={isLarge ? 'mt-1 h-4 w-5/6 rounded bg-[#3D2512]/20' : 'mt-1 h-4 w-4/5 rounded bg-[#3D2512]/20'} />

        <div className="mt-auto h-8 w-16 rounded-md border border-[#A46A10] bg-[#F4B925]/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]" />
      </div>
    </div>
  );
}

export function LeaderboardSkeleton({ variant = 'current' }: LeaderboardSkeletonProps) {
  return (
    <div className="flex w-full max-w-7xl flex-1 flex-col items-center">
      <header className="flex w-full max-w-4xl shrink-0 flex-col items-center min-h-40 sm:min-h-44 md:min-h-56">
        {variant === 'current' && (
          <div className="mb-7 flex w-full flex-col items-center gap-6 sm:mb-8 sm:gap-7">
            <ToggleSkeleton />
            <div className="flex w-full flex-col items-center gap-4 sm:gap-5">
              <PeriodNavSkeleton />
              <div className="h-5 w-44 animate-pulse rounded bg-white/25 sm:h-6 sm:w-56" aria-hidden />
            </div>
          </div>
        )}

        {variant === 'history' && (
          <div className="flex min-h-18 w-full flex-col items-center justify-start sm:min-h-20 md:min-h-22">
            <div className="h-8 w-56 animate-pulse rounded-lg bg-[#F4B925]/30 sm:h-10 sm:w-64 md:h-12 md:w-96" aria-hidden />
            <div className="mt-2 h-5 w-40 animate-pulse rounded bg-white/25 sm:w-48 md:h-7 md:w-60" aria-hidden />
          </div>
        )}
      </header>

      <div className="flex w-full max-w-7xl flex-1 flex-col items-center pt-3 sm:pt-4">
        <section className="w-full md:hidden" aria-hidden>
          <div className="rounded-2xl border-2 border-[#47331F] bg-[#3D2512]/75 px-2 py-3 shadow-xl sm:px-3">
            <div className="grid grid-cols-2 gap-2 pt-4 sm:gap-2.5">
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
          <div className="relative flex w-full justify-center pt-2">
            <div className="relative mt-[1.7rem] flex w-full flex-col items-center gap-2.5 sm:mt-[2.15rem] sm:flex-row sm:items-end sm:justify-center sm:gap-3 md:-translate-y-7 md:gap-4">
              <div className="relative flex justify-center sm:translate-y-11">
                <div className="absolute left-1/2 top-[-3.2rem] hidden h-7 w-32 -translate-x-1/2 rounded-[999px] border-2 border-[#8B613A] bg-[linear-gradient(180deg,#B88956_0%,#8B5E34_60%,#6A4323_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_4px_8px_rgba(0,0,0,0.2)] sm:block" />
                <SkeletonCard size="large" />
              </div>

              <div className="relative flex justify-center sm:translate-y-4">
                <div className="absolute left-1/2 top-[-3.2rem] hidden h-7 w-32 -translate-x-1/2 rounded-[999px] border-2 border-[#8B613A] bg-[linear-gradient(180deg,#B88956_0%,#8B5E34_60%,#6A4323_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_4px_8px_rgba(0,0,0,0.2)] sm:block" />
                <SkeletonCard size="large" />
              </div>

              <div className="relative flex justify-center sm:translate-y-11">
                <div className="absolute left-1/2 top-[-3.2rem] hidden h-7 w-32 -translate-x-1/2 rounded-[999px] border-2 border-[#8B613A] bg-[linear-gradient(180deg,#B88956_0%,#8B5E34_60%,#6A4323_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_4px_8px_rgba(0,0,0,0.2)] sm:block" />
                <SkeletonCard size="large" />
              </div>
            </div>
          </div>

          <div className="relative w-full rounded-[26px] border-2 border-[#6E4A2A] bg-[linear-gradient(180deg,rgba(180,130,82,0.95)_0%,rgba(145,99,58,0.96)_45%,rgba(105,66,35,0.98)_100%)] px-2 pb-5 pt-14 shadow-[0_20px_48px_rgba(30,16,7,0.38),inset_0_2px_0_rgba(255,255,255,0.08)] sm:px-3 sm:pb-6 sm:pt-14 md:px-4">
            <div className="absolute left-1/2 top-[0.4375rem] hidden h-7 w-[min(96%,940px)] -translate-x-1/2 rounded-[999px] border-2 border-[#8B613A] bg-[linear-gradient(180deg,#B88956_0%,#8B5E34_60%,#6A4323_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_4px_8px_rgba(0,0,0,0.2)] lg:block" />
            <div className="relative mt-0.5 grid grid-cols-2 gap-1.5 sm:mt-1 sm:grid-cols-3 sm:gap-2.5 md:grid-cols-4 md:gap-2.5 lg:mt-0.5 lg:grid-cols-7 lg:gap-2 xl:gap-2.5">
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
