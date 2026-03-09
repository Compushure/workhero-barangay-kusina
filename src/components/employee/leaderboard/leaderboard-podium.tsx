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
    <div className="flex items-end justify-center gap-6">
      {podiumOrder.map((entry) => (
        <div key={entry.userId} className={entry.rank === 1 ? '-translate-y-8' : ''}>
          <PortraitCard entry={entry} size="large" />
        </div>
      ))}
    </div>
  );
}
