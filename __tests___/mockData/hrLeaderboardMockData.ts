import type { RankLogPeriodType, RankingLeaderboardViewRow } from '@/types';

export type HrLeaderboardSeedRow = {
  userId: string;
  rank: number;
  performanceScore: number;
  totalKpiPoints?: number;
  badgePoints?: number;
  completedTaskCount?: number;
};

export const hrLeaderboardUnitGeneratedRows: RankingLeaderboardViewRow[] = [
  {
    ranking_period_id: 'period-1',
    period_type: 'weekly',
    period_start: '2026-03-30',
    period_end: '2026-04-05',
    is_visible: false,
    generated_at: '2026-04-06T00:00:00.000Z',
    period_label: 'Week 14, 2026',
    entry_id: 'entry-1',
    user_id: 'employee-1',
    user_name: 'Employee One',
    rank: 1,
    performance_score: 300,
    total_kpi_points: 260,
    badge_points: 40,
    completed_task_count: 12,
  },
];

export const hrLeaderboardUnitSelection: {
  periodType: RankLogPeriodType;
  year: number;
  week: number;
} = {
  periodType: 'weekly',
  year: 2026,
  week: 14,
};

export const hrLeaderboardIntegrationPeriodA = {
  year: 2099,
  week: 3,
  firstScore: 420,
  secondScore: 380,
};

export const hrLeaderboardIntegrationPeriodB = {
  year: 2099,
  week: 4,
  firstScore: 510,
  secondScore: 490,
};

export const hrLeaderboardIntegrationNames = {
  hrReader: {
    namePrefix: 'HR Leaderboard Reader',
    emailPrefix: 'hr.leaderboard.reader',
  },
  employeeOne: {
    namePrefix: 'HR Leaderboard Employee One',
    emailPrefix: 'hr.leaderboard.employee.one',
  },
  employeeTwo: {
    namePrefix: 'HR Leaderboard Employee Two',
    emailPrefix: 'hr.leaderboard.employee.two',
  },
  hrHistory: {
    namePrefix: 'HR Leaderboard History',
    emailPrefix: 'hr.leaderboard.history',
  },
  historyEmployeeOne: {
    namePrefix: 'HR History Employee One',
    emailPrefix: 'hr.history.employee.one',
  },
  historyEmployeeTwo: {
    namePrefix: 'HR History Employee Two',
    emailPrefix: 'hr.history.employee.two',
  },
};

export function createHrLeaderboardSeedRows(args: {
  firstUserId: string;
  secondUserId: string;
  firstScore: number;
  secondScore: number;
}): HrLeaderboardSeedRow[] {
  return [
    { userId: args.firstUserId, rank: 1, performanceScore: args.firstScore },
    { userId: args.secondUserId, rank: 2, performanceScore: args.secondScore },
  ];
}
