/**
 * HR Leaderboard Types
 * ====================
 * Types related to employee leaderboards and rankings
 */

import type { UserBadge } from '@/actions/employee/badges';

/**
 * Leaderboard player interface
 * Represents a player on the leaderboard with ranking info
 */
export interface LeaderboardPlayer {
  id: string;
  name: string;
  performanceScore: number;
  image: string | null;
  badges: UserBadge[];
}

/**
 * Player type (alias for LeaderboardPlayer)
 */
export type Player = LeaderboardPlayer;

/**
 * Database query result types
 */

/**
 * Result from user_attributes view query
 */
export interface UserAttributesRow {
  user_id: string;
  user_name: string | null;
  performance_score: number | null;
  role_type: string;
}

/**
 * Result from user_collected_badges_view query
 */
export interface UserCollectedBadgesRow {
  awarded_to_id: string;
  collected_badges: UserBadge[] | null;
}

/**
 * Result from get_leaderboard_as_of RPC function
 */
export interface LeaderboardAsOfRow {
  user_id: string;
  user_name: string | null;
  performance_score: number | null;
  total_kpi_points: number | null;
  badge_points: number | null;
  task_count: number | null;
}

// ---------------------------------------------------------------------------
// Ranking Period & Entry types (normalized schema)
// ---------------------------------------------------------------------------

export type RankingPeriodType = 'weekly' | 'monthly' | 'yearly';

/** Backward-compat alias — used by page.tsx, period-selector.tsx, etc. */
export type RankLogPeriodType = RankingPeriodType;

/** Row from the RankingPeriod table */
export interface RankingPeriodRow {
  id: string;
  period_type: RankingPeriodType;
  period_start: string; // ISO date string (YYYY-MM-DD)
  period_end: string;
  is_visible: boolean;
  generated_at: string;
}

/** Row from the RankingEntry table */
export interface RankingEntryRow {
  id: string;
  ranking_period_id: string;
  user_id: string;
  rank: number;
  performance_score: number;
  total_kpi_points: number;
  badge_points: number;
  completed_task_count: number;
}

/** Flat row from ranking_leaderboard_view (join of RankingPeriod + RankingEntry + User) */
export interface RankingLeaderboardViewRow {
  ranking_period_id: string;
  period_type: RankingPeriodType;
  period_start: string;
  period_end: string;
  is_visible: boolean;
  generated_at: string;
  period_label: string;
  entry_id: string;
  user_id: string;
  user_name: string;
  rank: number;
  performance_score: number;
  total_kpi_points: number;
  badge_points: number;
  completed_task_count: number;
}
