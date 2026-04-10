import type { RankLogPeriodType } from '@/types';

export type EmployeeLeaderboardRankingEntryRow = {
  user_id: string;
  rank: number;
  performance_score: number | null;
};

export type EmployeeLeaderboardViewRow = {
  user_id: string;
  user_name: string;
  rank: number;
  performance_score: number | null;
};

export const employeeLeaderboardSessionUser = {
  id: 'employee-1',
  email: 'employee.one@example.com',
};

export const employeeLeaderboardLatestPeriod = {
  id: 'period-weekly-2026-14',
  period_start: '2026-03-30',
  is_visible: true,
};

export const employeeLeaderboardRankingEntries: EmployeeLeaderboardRankingEntryRow[] = [
  { user_id: 'employee-2', rank: 1, performance_score: 220 },
  { user_id: 'employee-1', rank: 2, performance_score: 180 },
  { user_id: 'employee-3', rank: 3, performance_score: 160 },
];

export const employeeLeaderboardRows: EmployeeLeaderboardViewRow[] = [
  { user_id: 'employee-2', user_name: 'Employee Two', rank: 1, performance_score: 220 },
  { user_id: 'employee-1', user_name: 'Employee One', rank: 2, performance_score: 180 },
  { user_id: 'employee-3', user_name: 'Employee Three', rank: 3, performance_score: 160 },
];

export const employeeLeaderboardPeriodSelection: {
  periodType: RankLogPeriodType;
  year: number;
  week: number;
} = {
  periodType: 'weekly',
  year: 2026,
  week: 14,
};

export const employeeLeaderboardIntegrationPeriodA = {
  year: 2099,
  week: 1,
  firstScore: 320,
  secondScore: 280,
};

export const employeeLeaderboardIntegrationPeriodB = {
  year: 2099,
  week: 2,
  firstScore: 500,
  secondScore: 450,
};

export const employeeLeaderboardIntegrationNames = {
  employee: {
    namePrefix: 'Leaderboard Employee',
    emailPrefix: 'leaderboard.employee',
  },
  competitor: {
    namePrefix: 'Leaderboard Competitor',
    emailPrefix: 'leaderboard.competitor',
  },
  rankEmployee: {
    namePrefix: 'Leaderboard Rank Employee',
    emailPrefix: 'leaderboard.rank.employee',
  },
  rankCompetitor: {
    namePrefix: 'Leaderboard Rank Competitor',
    emailPrefix: 'leaderboard.rank.competitor',
  },
};
