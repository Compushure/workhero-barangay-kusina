import type { EmployeeTopRankEntry } from '@/types';
import { PortraitCard } from './portrait-card';

type LeaderboardShelfProps = {
  entries: EmployeeTopRankEntry[];
};

export function LeaderboardShelf({ entries }: LeaderboardShelfProps) {
  if (entries.length === 0) return null;

  return (
    <div className="w-full rounded-2xl border-2 border-[#47331F] bg-[#3D2512]/75 px-3 py-4 shadow-xl sm:px-4 sm:py-5 md:px-6">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:gap-3.5 lg:grid-cols-7 lg:gap-4">
        {entries.map((entry) => (
          <PortraitCard key={entry.userId} entry={entry} size="small" />
        ))}
      </div>
    </div>
  );
}
