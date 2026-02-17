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
