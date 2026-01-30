import { StatsBar } from './stats-bar';
import { MOCK_EMPLOYEE_STATS } from './constants';

/**
 * HeaderSection - Server Component
 * Top header row with coins, XP, and profile
 */
export async function HeaderSection() {
  return (
    <div className="rounded-2xl bg-linear-to-b from-amber-100 via-orange-100 to-red-100 px-6 py-4 shadow-lg">
      <StatsBar stats={MOCK_EMPLOYEE_STATS} />
    </div>
  );
}
