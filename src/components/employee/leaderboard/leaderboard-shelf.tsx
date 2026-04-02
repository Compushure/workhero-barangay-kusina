import type { EmployeeTopRankEntry } from '@/types';
import { PortraitCard } from './portrait-card';

type LeaderboardShelfProps = {
  entries: EmployeeTopRankEntry[];
};

export function LeaderboardShelf({ entries }: LeaderboardShelfProps) {
  if (entries.length === 0) return null;

  return (
    <section className="relative w-full rounded-[26px] border-2 border-[#6E4A2A] bg-[linear-gradient(180deg,rgba(155,110,67,0.98),rgba(116,79,45,0.98))] px-2 pb-4 pt-12 shadow-[0_20px_36px_rgba(0,0,0,0.3),inset_0_2px_0_rgba(255,232,196,0.12)] sm:px-3 sm:pb-5 sm:pt-13 md:px-4 md:pb-6 md:pt-14">
      <div
        className="absolute left-1/2 top-[0.4375rem] hidden h-7 w-[min(96%,940px)] -translate-x-1/2 rounded-[999px] border-2 border-[#8B613A] bg-[linear-gradient(180deg,#A87445_0%,#8D6038_22%,#734927_70%,#5B351D_100%)] shadow-[0_10px_18px_rgba(0,0,0,0.24),inset_0_2px_0_rgba(255,229,186,0.28),inset_0_-3px_0_rgba(78,47,24,0.35)] lg:block"
        aria-hidden
      >
        <div className="absolute inset-x-5 top-1.5 h-px bg-[#F0CF9E]/30" />
        <div className="absolute left-5 right-5 top-1/2 h-px -translate-y-1/2 bg-[#D4AE84]/22" />
        <div className="absolute inset-x-8 bottom-1.5 h-1 rounded-full bg-[#4F2E18]/30 blur-[1px]" />
      </div>
      
      <div className="relative mt-0.5 grid grid-cols-2 gap-1.5 sm:mt-1 sm:grid-cols-3 sm:gap-2 md:grid-cols-4 md:gap-2 lg:mt-0.5 lg:grid-cols-7 lg:gap-2 xl:gap-2.5">
        {entries.map((entry) => (
          <PortraitCard key={entry.userId} entry={entry} size="small" />
        ))}
      </div>
    </section>
  );
}
