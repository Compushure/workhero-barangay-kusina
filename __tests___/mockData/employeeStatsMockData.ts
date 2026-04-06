import type { LevelMetadata } from '@/actions/employee/stats';

export const employeeStatsUserRowMockData = {
  id: 'employee-1',
  points: 75,
  deducted_points: 5,
  xp: 20,
  level: 2,
  total_xp: null as number | null,
};

export const levelMetadataMockData: LevelMetadata[] = [
  { level: 1, xp: 0, description: 'Level 1 - Trainee' },
  { level: 2, xp: 100, description: 'Level 2 - Apprentice' },
  { level: 3, xp: 250, description: 'Level 3 - Skilled' },
  { level: 4, xp: 450, description: 'Level 4 - Experienced' },
  { level: 5, xp: 700, description: 'Level 5 - Expert' },
  { level: 6, xp: 1000, description: 'Level 6 - Master' },
  { level: 7, xp: 1350, description: 'Level 7 - Grand Master' },
  { level: 8, xp: 1750, description: 'Level 8 - Legendary' },
  { level: 9, xp: 2200, description: 'Level 9 - Mythic' },
  { level: 10, xp: 2700, description: 'Level 10 - Ultimate Chef' },
];

