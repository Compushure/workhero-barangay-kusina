/**
 * Manager Badge Assignment Types
 * ==============================
 * Types for manually awarding badges.
 */

export type BadgeInterval = 'none' | 'daily' | 'monthly' | 'anually';

export interface BadgeSummary {
  id: string;
  name: string;
  description: string | null;
  points: number;
  img_link: string | null;
  award_at_interval: BadgeInterval;
}

export interface CollectedBadge {
  userbadge_id: string;
  badge_id: string;
  badge_name: string;
  awarded_by_id: string | null;
  awarded_by_name: string | null;
  date_acquired: string;
}

export interface BadgeAssignmentUser {
  id: string;
  employee_id: string | null;
  name: string;
  email: string;
  profilePictureUrl: string | null;
  badge_ids: string[];
  collected_badges: CollectedBadge[];
}

export interface BadgeAwardDebugEntry {
  id: string;
  badge_id: string;
  badge_name: string;
  badge_points: number;
  awarded_to_id: string;
  awarded_to_name: string;
  employee_id: string | null;
  awarded_by_id: string | null;
  awarded_by_name: string | null;
  user_points: number;
  date_acquired: string;
}
