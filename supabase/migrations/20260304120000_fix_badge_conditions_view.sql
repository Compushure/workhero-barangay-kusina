-- Fix badge_conditions_view to avoid multiplicative rows from UserBadges join
-- Re-aggregate requirements and collected badges via scoped subqueries
-- so condition counts aren't inflated by awarded badge rows.

BEGIN;

CREATE OR REPLACE VIEW "public"."badge_conditions_view" AS
SELECT
  b.id AS badge_id,
  b.name AS badge_name,
  b.description AS badge_description,
  b.points AS badge_points,
  b.img_link AS badge_img_link,
  b.award_at_interval AS badge_award_at_interval,
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', r.id,
          'requirement_type', r.requirement_type::text,
          'requirement_operator', r.requirement_operator::text,
          'requirement_interval', r.requirement_interval::text,
          'requirement_attrb_id', r.requirement_attrb_id,
          'requirement_attrb_value', r.requirement_attrb_value,
          'logic_type', r.logic_type::text
        )
        ORDER BY r.id
      )
      FROM "public"."BadgeRequirements" r
      WHERE r.badge_id = b.id
    ),
    '[]'::jsonb
  ) AS conditions,
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', ub.id,
          'awarded_to', ub.awarded_to,
          'date_acquired', ub.date_acquired,
          'badge_id', ub.badge_id,
          'badge_name', b.name,
          'badge_description', b.description,
          'badge_points', b.points,
          'badge_img_link', b.img_link
        )
        ORDER BY ub.date_acquired
      )
      FROM "public"."UserBadges" ub
      WHERE ub.badge_id = b.id
    ),
    '[]'::jsonb
  ) AS collected_badges,
  COALESCE(
    (
      SELECT jsonb_agg(r.logic_type::text ORDER BY r.id)
      FROM "public"."BadgeRequirements" r
      WHERE r.badge_id = b.id AND r.logic_type IS NOT NULL
    ),
    '[]'::jsonb
  ) AS requirements_logic_type
FROM "public"."Badges" b;

COMMIT;
