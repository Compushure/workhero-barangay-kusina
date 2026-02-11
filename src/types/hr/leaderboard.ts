/**
 * HR Leaderboard Types
 * ====================
 * Types related to employee leaderboards and rankings
 */

/**
 * Leaderboard player interface
 * Represents a player on the leaderboard with ranking info
 */
export interface LeaderboardPlayer {
  id: string;
  name: string;
  performanceScore: number;
  image: string | null;
}

/**
 * Player type (alias for LeaderboardPlayer)
 */
export type Player = LeaderboardPlayer;
