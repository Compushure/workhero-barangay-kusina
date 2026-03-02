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
  role_type: string;
}

/**
 * RankLog Types
 * =============
 * Types for persisted HR-generated rankings
 */

export type RankLogPeriodType = 'weekly' | 'monthly' | 'yearly';

/**
 * Single ranked employee entry stored inside the RankLog.rankings JSONB array
 */
export interface RankLogEntry {
  rank: number;
  user_id: string;
  user_name: string;
  performance_score: number;
}

/**
 * Row from the RankLog table
 */
export interface RankLogRow {
  id: string;
  period_type: RankLogPeriodType;
  period_year: number;
  period_month: number | null;
  period_week: number | null;
  period_label: string;
  rankings: RankLogEntry[];
  is_visible: boolean;
  generated_by: string;
  generated_at: string;
}
