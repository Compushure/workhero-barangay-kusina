type LeaderboardSkeletonProps = {
  variant?: 'current' | 'history';
};

function ToggleSkeleton() {
  return (
    <div
      className="w-full max-w-[388px] rounded-[12px] border-[3px] border-[#47331F] bg-[linear-gradient(180deg,#6E4A2C_0%,#55361E_100%)] p-1.5 shadow-[0_10px_18px_rgba(0,0,0,0.28),4px_4px_0px_#000] shadow-[#3017008e] sm:max-w-[412px]"
      aria-hidden
    >
      <div className="inline-flex w-full overflow-hidden rounded-[8px] border-2 border-[#7F5733] bg-[#5B3E29] shadow-[inset_0_1px_0_rgba(255,225,181,0.14)]">
        <div className="h-10 flex-1 animate-pulse bg-[#6F4A2B] sm:h-11" />
        <div className="h-10 flex-1 animate-pulse border-l-[3px] border-[#47331F] bg-[#6F4A2B] sm:h-11" />
      </div>
    </div>
  );
}

function PeriodNavSkeleton() {
  return (
    <div className="inline-flex w-full items-center justify-center gap-3 sm:gap-4" aria-hidden>
      <div className="h-12 w-12 shrink-0 animate-pulse rounded-sm border-[3px] border-[#47331F] bg-[#6F4A2B]/80 shadow-[4px_4px_0px_#000] shadow-[#3017008e] sm:h-[3.2rem] sm:w-[3.2rem]" />
      <div className="h-6 flex-1 animate-pulse rounded bg-[#F4B925]/35 sm:h-7" />
      <div className="h-12 w-12 shrink-0 animate-pulse rounded-sm border-[3px] border-[#47331F] bg-[#6F4A2B]/80 shadow-[4px_4px_0px_#000] shadow-[#3017008e] sm:h-[3.2rem] sm:w-[3.2rem]" />
    </div>
  );
}

function HistoryDatePickerSkeleton() {
  return (
    <div className="w-full" aria-hidden>
      <div className="flex min-h-10 w-full items-center gap-2 rounded-sm border-[3px] border-[#47331F] bg-[#6F4A2B] px-3 py-2 shadow-[4px_4px_0px_#000] shadow-[#3017008e] sm:min-h-11 sm:px-4">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border-2 border-[#47331F] bg-[#5B3E29] shadow-[inset_0_1px_0_rgba(255,225,181,0.12)] sm:h-8 sm:w-8">
          <div className="h-4 w-4 animate-pulse rounded-sm bg-[#F4B925]/45 sm:h-[18px] sm:w-[18px]" />
        </div>
        <div className="h-4 flex-1 animate-pulse rounded bg-white/30 sm:h-5" />
        <div className="h-3.5 w-3.5 animate-pulse rounded-full bg-[#CF8B22]/75" />
      </div>
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
          isLarge ? 'h-11 w-11 sm:h-12 sm:w-12' : 'h-10 w-10 sm:h-[2.625rem] sm:w-[2.625rem]',
        ].join(' ')}
      >
        <div
          className={
            isLarge
              ? 'h-[1.125rem] w-[1.125rem] rounded bg-[#3D2512]/35'
              : 'h-4 w-4 rounded bg-[#3D2512]/35'
          }
        />
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

        <div
          className={
            isLarge
              ? 'mt-1 h-4 w-5/6 rounded bg-[#3D2512]/20'
              : 'mt-1 h-4 w-4/5 rounded bg-[#3D2512]/20'
          }
        />

        <div className="mt-auto h-8 w-16 rounded-md border border-[#A46A10] bg-[#F4B925]/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]" />
      </div>
    </div>
  );
}

export function LeaderboardSkeleton({ variant = 'current' }: LeaderboardSkeletonProps) {
  return (
    <div
      className={`flex w-full ${variant === 'history' ? 'max-w-5xl' : 'max-w-5xl'} flex-1 flex-col items-center`}
    >
      <header
        className={`flex w-full shrink-0 flex-col items-center ${
          variant === 'history' ? 'max-w-3xl' : 'max-w-3xl'
        }`}
      >
        {variant === 'current' && (
          <div className="mb-5 flex w-full flex-col items-center gap-5 px-1 sm:mb-6 sm:gap-6">
            <ToggleSkeleton />
            <div className="flex w-full flex-col items-center gap-5 sm:gap-6">
              <div className="flex w-full max-w-[388px] justify-center sm:max-w-[412px]">
                <PeriodNavSkeleton />
              </div>
              <div
                className="flex min-h-10 w-full flex-col items-center justify-start sm:min-h-12"
                aria-hidden
              >
                <div className="h-5 w-44 animate-pulse rounded bg-white/25 sm:h-6 sm:w-56" />
              </div>
            </div>
          </div>
        )}

        {variant === 'history' && (
          <>
            <div className="mb-5 w-full max-w-[388px] self-center sm:mb-6 sm:max-w-[412px]">
              <ToggleSkeleton />
            </div>
            <div className="relative z-10 mb-5 flex w-full max-w-3xl shrink-0 flex-col items-center gap-5 px-1 sm:mb-6 sm:gap-6">
              <div className="mt-6 flex w-full max-w-[388px] flex-col items-center justify-center gap-3 sm:mt-7 sm:max-w-[412px] sm:flex-row sm:items-center sm:justify-center sm:gap-3">
                <div className="flex w-full justify-center sm:w-[52%]">
                  <PeriodNavSkeleton />
                </div>
                <div className="w-full sm:w-[48%]">
                  <HistoryDatePickerSkeleton />
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      <div
        className={`flex w-full ${variant === 'history' ? 'max-w-5xl' : 'max-w-7xl'} flex-1 flex-col items-center pt-3 sm:pt-4`}
      >
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

        <div
          className={`hidden w-full flex-col items-center ${variant === 'history' ? 'gap-6 md:gap-8' : 'gap-6 md:gap-8'} md:flex`}
          aria-hidden
        >
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
