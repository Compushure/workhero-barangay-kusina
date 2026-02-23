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
