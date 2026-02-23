/**
 * Type definitions for the employee dashboard
 */

export interface Task {
  id: string;
  title: string;
  category: 'client-centered' | 'internal' | 'cpd';
  completed: number;
  total: number;
  xpReward: number;
  dueDate: string;
}

export interface EmployeeStats {
  coins: number;
  level: number;
  xp: {
    current: number;
    total: number;
  };
}

export interface RankingInfo {
  rank: number;
  period: string;
  totalFiestasEarned: number;
  totalXpEarned: number;
}

export interface NotificationMessage {
  id: string;
  icon?: string;
  text: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

export type SortOption = 'recent' | 'upcoming' | 'progress' | 'rewards';
