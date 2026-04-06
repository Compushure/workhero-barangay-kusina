import type { Badge } from '@/types/manager/badge-editor';
import type { AddBadgeInput, EditBadgeInput } from '@/zod/schemas/badge';

export const addBadgeInputMockData: AddBadgeInput = {
  name: 'Attendance Ace',
  description: 'Awarded for strong attendance',
  points: 40,
  award_at_interval: 'none',
  img_link: null,
  conditions: [
    {
      requirement_type: 'attendance',
      requirement_operator: '>=',
      requirement_attrb_id: 'is_overtime',
      requirement_attrb_value: 2,
      logic_type: 'and',
    },
  ],
};

export const editBadgeInputMockData: EditBadgeInput = {
  name: 'Attendance Hero',
  description: 'Updated badge details',
  points: 55,
  award_at_interval: 'monthly',
  img_link: 'https://cdn.example.com/badges/attendance-hero.png',
  conditions: [
    {
      requirement_type: 'attribute',
      requirement_operator: '>=',
      requirement_attrb_id: 'total_points_earned',
      requirement_attrb_value: 100,
      logic_type: 'or',
    },
  ],
};

export const badgeViewRowMockData = {
  badge_id: 'badge-1',
  badge_name: 'Attendance Ace',
  badge_description: 'Awarded for strong attendance',
  badge_points: 40,
  badge_img_link: null,
  badge_award_at_interval: 'none',
  badge_created_at: '2026-04-02T10:00:00.000Z',
  conditions: [
    {
      id: 'requirement-1',
      requirement_type: 'attendance',
      requirement_operator: '>=',
      requirement_attrb_id: 'is_overtime',
      requirement_attrb_value: 2,
      requirement_interval: 'none',
      logic_type: 'and',
    },
  ],
};

export const expectedBadgeMockData: Badge = {
  id: badgeViewRowMockData.badge_id,
  name: badgeViewRowMockData.badge_name,
  description: badgeViewRowMockData.badge_description,
  points: badgeViewRowMockData.badge_points,
  img_link: badgeViewRowMockData.badge_img_link,
  award_at_interval: 'none',
  created_at: badgeViewRowMockData.badge_created_at,
  created_by_name: 'Manager Seed',
  conditions: [
    {
      id: 'requirement-1',
      requirement_type: 'attendance',
      requirement_operator: '>=',
      requirement_attrb_id: 'is_overtime',
      requirement_attrb_value: 2,
      requirement_interval: 'none',
      logic_type: 'and',
    },
  ],
};

export function createBadgeImageFile(
  fileName: string = 'badge.png',
  type: string = 'image/png',
  content: string = 'badge-image'
) {
  return new File([Buffer.from(content)], fileName, { type });
}
