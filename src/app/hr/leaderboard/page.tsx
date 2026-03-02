import { Suspense } from 'react';
import { Trophy } from 'lucide-react';
import { LeaderboardSkeleton } from '@/components/hr/leaderboard/leaderboard-skeleton';
import { LeaderboardContent } from '@/components/hr/leaderboard/leaderboard-content';
import GenerateRankingDialog from '@/components/hr/leaderboard/generate-ranking-dialog';
import { PeriodTypeDropdown } from '@/components/hr/leaderboard/period-type-dropdown';
import type { RankLogPeriodType } from '@/types';

interface LeaderboardPageProps {
  searchParams: Promise<{ type?: string; id?: string; page?: string }>;
}

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const params = await searchParams;
  const periodType: RankLogPeriodType =
    params.type && ['weekly', 'monthly', 'yearly'].includes(params.type)
      ? (params.type as RankLogPeriodType)
      : 'weekly';
  const selectedId = params.id;
  const currentPage = Math.max(1, Number(params.page ?? 1));

  return (
    <div className="p-4 sm:p-8 bg-[#F3F3F3] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
              <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-[#F59E0B]" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#6D1616]">
                Leaderboards
              </h1>
              <p className="text-sm text-[#5a2a2a]">
                View and manage performance rankings across weekly, monthly, and yearly periods.
              </p>
            </div>
          </div>

          {!selectedId && (
            <div className="flex items-center justify-end gap-3 sm:gap-4">
              <PeriodTypeDropdown currentType={periodType} basePath="/hr/leaderboard" />
              <GenerateRankingDialog defaultPeriodType={periodType} />
            </div>
          )}
        </div>

        <Suspense fallback={<LeaderboardSkeleton />}>
          <LeaderboardContent
            periodType={periodType}
            selectedId={selectedId}
            currentPage={currentPage}
          />
        </Suspense>
      </div>
    </div>
  );
}
