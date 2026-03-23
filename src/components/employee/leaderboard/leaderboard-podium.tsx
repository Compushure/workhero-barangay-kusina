import type { EmployeeTopRankEntry } from '@/types';
import { PortraitCard } from './portrait-card';

type LeaderboardPodiumProps = {
  entries: EmployeeTopRankEntry[];
};

export function LeaderboardPodium({ entries }: LeaderboardPodiumProps) {
  const podiumOrder =
    entries.length === 3
      ? [entries[1], entries[0], entries[2]]
      : entries.length === 2
        ? [entries[1], entries[0]]
        : entries;

  return (
    <section className="relative flex w-full justify-center pt-2">
      <div className="relative mt-[1.7rem] flex w-full flex-col items-center gap-2.5 sm:mt-[2.15rem] sm:flex-row sm:items-end sm:justify-center sm:gap-3 md:-translate-y-7 md:gap-4">
        {podiumOrder.map((entry) => (
          <div
            key={entry.userId}
            className={`relative flex justify-center ${entry.rank === 1 ? 'sm:translate-y-4' : 'sm:translate-y-8'}`}
          >
            <div
              className="absolute left-1/2 top-[-3.2rem] hidden h-7 w-32 -translate-x-1/2 rounded-[999px] border-2 border-[#8B613A] bg-[linear-gradient(180deg,#A87445_0%,#8D6038_22%,#734927_70%,#5B351D_100%)] shadow-[0_10px_18px_rgba(0,0,0,0.24),inset_0_2px_0_rgba(255,229,186,0.28),inset_0_-3px_0_rgba(78,47,24,0.35)] md:block"
              aria-hidden
            >
              <div className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-[#B9804C] bg-[radial-gradient(circle_at_35%_35%,#E8C08B_0%,#A66D3A_65%,#6F4525_100%)] shadow-[0_2px_4px_rgba(0,0,0,0.18)]" />
              <div className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-[#B9804C] bg-[radial-gradient(circle_at_35%_35%,#E8C08B_0%,#A66D3A_65%,#6F4525_100%)] shadow-[0_2px_4px_rgba(0,0,0,0.18)]" />
              <div className="absolute inset-x-5 top-1.5 h-px bg-[#F0CF9E]/30" />
              <div className="absolute left-5 right-5 top-1/2 h-px -translate-y-1/2 bg-[#D4AE84]/22" />
              <div className="absolute inset-x-8 bottom-1.5 h-1 rounded-full bg-[#4F2E18]/30 blur-[1px]" />
            </div>
            <PortraitCard entry={entry} size="large" />
          </div>
        ))}
      </div>
    </section>
  );
}
