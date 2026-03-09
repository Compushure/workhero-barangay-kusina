import type { EmployeeTopRankEntry } from '@/types';
import { PortraitCard } from './portrait-card';

type LeaderboardShelfProps = {
  entries: EmployeeTopRankEntry[];
};

export function LeaderboardShelf({ entries }: LeaderboardShelfProps) {
  if (entries.length === 0) return null;

  return (
    <div className="w-full bg-[#3D2512]/75 rounded-2xl border-2 border-[#47331F] shadow-xl px-6 py-5">
      <div className="flex flex-nowrap justify-center gap-4">
        {entries.map((entry) => (
          <PortraitCard key={entry.userId} entry={entry} size="small" />
        ))}
      </div>
    </div>
  );
}
