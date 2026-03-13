/**
 * Manager Badge Editor Types
 * ==========================
 * Types related to badge creation and conditions.
 */

export type BadgeRequirementType = 'task' | 'attribute' | 'attendance';
export type BadgeOperator = '=' | '>' | '<' | '>=' | '<=' | '!=';
export type BadgeInterval = 'none' | 'daily' | 'monthly' | 'anually';
export type BadgeLogicType = 'and' | 'or';

export interface BadgeCondition {
  id: string;
  requirement_type: BadgeRequirementType;
  requirement_operator: BadgeOperator;
  requirement_attrb_id: string | null;
  requirement_attrb_value: number;
  requirement_interval?: BadgeInterval;
  logic_type: BadgeLogicType;
}

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  points: number;
  award_at_interval: BadgeInterval;
  img_link: string | null;
  created_at?: string | null;
  created_by_name?: string | null;
  conditions: BadgeCondition[];
}

export interface BadgeOption {
  id: string;
  name: string;
}
