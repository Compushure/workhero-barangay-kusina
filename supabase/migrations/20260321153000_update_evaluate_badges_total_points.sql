-- Migration: Ensure evaluate_badges awards both points and total_points_earned
-- Date: 2026-03-21
-- Purpose:
--   1) Update evaluate_badges to increment both User.points and User.total_points_earned
--   2) Ensure points/notification are only applied when a badge is newly awarded

CREATE OR REPLACE FUNCTION public.evaluate_badges(p_interval public.period_intervals_enum)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  badge_rec RECORD;
  user_rec RECORD;
  req_rec RECORD;
  all_and_met boolean;
  any_or_met boolean;
  has_or_conditions boolean;
  has_and_conditions boolean;
  condition_met boolean;
  task_completed_orders integer;
  attendance_count integer;
  attr_value numeric;
  awarded_badge_id uuid;
BEGIN
  FOR badge_rec IN
    SELECT *
    FROM public."Badges"
    WHERE award_at_interval = p_interval
      AND award_at_interval <> 'none'::public.period_intervals_enum
  LOOP
    -- Skip badges with no requirements
    IF NOT EXISTS (
      SELECT 1
      FROM public."BadgeRequirements" br
      WHERE br.badge_id = badge_rec.id
    ) THEN
      CONTINUE;
    END IF;

    FOR user_rec IN SELECT id FROM public."User" LOOP
      all_and_met := true;
      any_or_met := false;
      has_or_conditions := false;
      has_and_conditions := false;

      -- Check for presence of OR and AND conditions
      SELECT EXISTS(
        SELECT 1 FROM public."BadgeRequirements"
        WHERE badge_id = badge_rec.id AND logic_type = 'or'
      ) INTO has_or_conditions;

      SELECT EXISTS(
        SELECT 1 FROM public."BadgeRequirements"
        WHERE badge_id = badge_rec.id AND logic_type = 'and'
      ) INTO has_and_conditions;

      FOR req_rec IN
        SELECT *
        FROM public."BadgeRequirements"
        WHERE badge_id = badge_rec.id
      LOOP
        condition_met := false;

        IF req_rec.requirement_type = 'task' THEN
          -- Use completed_orders instead of COUNT(*)
          SELECT COALESCE(SUM(tiv.completed_orders), 0)
          INTO task_completed_orders
          FROM public.task_info_view tiv
          WHERE tiv.assigned_to = user_rec.id
            AND tiv.category_id = req_rec.requirement_attrb_id::uuid
            AND tiv.status = 'approved';

          condition_met := CASE req_rec.requirement_operator
            WHEN '=' THEN task_completed_orders = req_rec.requirement_attrb_value
            WHEN '>' THEN task_completed_orders > req_rec.requirement_attrb_value
            WHEN '<' THEN task_completed_orders < req_rec.requirement_attrb_value
            WHEN '>=' THEN task_completed_orders >= req_rec.requirement_attrb_value
            WHEN '<=' THEN task_completed_orders <= req_rec.requirement_attrb_value
            WHEN '!=' THEN task_completed_orders <> req_rec.requirement_attrb_value
            ELSE false
          END;

        ELSIF req_rec.requirement_type = 'attendance' THEN
          SELECT COUNT(*)
          INTO attendance_count
          FROM public.attendance_log_view alv
          WHERE alv.employee_id = user_rec.id
            AND CASE req_rec.requirement_attrb_id
              WHEN 'is_overtime' THEN COALESCE(alv.is_overtime, false)
              WHEN 'is_absent' THEN COALESCE(alv.is_absent, false)
              WHEN 'is_undertime' THEN COALESCE(alv.is_undertime, false)
              WHEN 'over_breaktime' THEN COALESCE(alv.over_breaktime, false)
              ELSE false
            END;

          condition_met := CASE req_rec.requirement_operator
            WHEN '=' THEN attendance_count = req_rec.requirement_attrb_value
            WHEN '>' THEN attendance_count > req_rec.requirement_attrb_value
            WHEN '<' THEN attendance_count < req_rec.requirement_attrb_value
            WHEN '>=' THEN attendance_count >= req_rec.requirement_attrb_value
            WHEN '<=' THEN attendance_count <= req_rec.requirement_attrb_value
            WHEN '!=' THEN attendance_count <> req_rec.requirement_attrb_value
            ELSE false
          END;

        ELSIF req_rec.requirement_type = 'attribute' THEN
          SELECT CASE req_rec.requirement_attrb_id
            WHEN 'user_level' THEN ua.user_level
            WHEN 'total_xp' THEN ua.total_xp
            WHEN 'total_points_earned' THEN ua.total_points_earned
            ELSE NULL
          END
          INTO attr_value
          FROM public.user_attributes ua
          WHERE ua.user_id = user_rec.id;

          condition_met := CASE req_rec.requirement_operator
            WHEN '=' THEN attr_value = req_rec.requirement_attrb_value
            WHEN '>' THEN attr_value > req_rec.requirement_attrb_value
            WHEN '<' THEN attr_value < req_rec.requirement_attrb_value
            WHEN '>=' THEN attr_value >= req_rec.requirement_attrb_value
            WHEN '<=' THEN attr_value <= req_rec.requirement_attrb_value
            WHEN '!=' THEN attr_value <> req_rec.requirement_attrb_value
            ELSE false
          END;
        END IF;

        -- Apply logic type
        IF req_rec.logic_type = 'and' THEN
          IF NOT condition_met THEN
            all_and_met := false;
          END IF;
        ELSIF req_rec.logic_type = 'or' THEN
          IF condition_met THEN
            any_or_met := true;
          END IF;
        END IF;
      END LOOP;

      -- Award badge based on logic:
      -- 1. If only AND conditions: all must be met
      -- 2. If only OR conditions: at least one must be met
      -- 3. If both: all AND must be met + at least one OR must be met
      IF (NOT has_and_conditions OR all_and_met) AND
         (NOT has_or_conditions OR any_or_met) THEN
        awarded_badge_id := NULL;

        -- Insert the badge award and capture whether it was newly inserted.
        INSERT INTO public."UserBadges"(badge_id, awarded_to, date_acquired)
        VALUES (badge_rec.id, user_rec.id, now())
        ON CONFLICT (badge_id, awarded_to) DO NOTHING
        RETURNING id INTO awarded_badge_id;

        -- Only award points/notification when badge is newly acquired.
        IF awarded_badge_id IS NOT NULL THEN
          UPDATE public."User"
          SET
            points = COALESCE(points, 0) + badge_rec.points,
            total_points_earned = COALESCE(total_points_earned, 0) + badge_rec.points
          WHERE id = user_rec.id
            AND badge_rec.points > 0;

          -- Insert notification for automatic badge award
          INSERT INTO public."Notification"(user_id, type, message, metadata)
          VALUES (
            user_rec.id,
            'badge',
            'You''ve been automatically awarded the ' || badge_rec.name || ' badge by the system and have earned ' || badge_rec.points || ' bonus points.',
            jsonb_build_object(
              'badgeId', badge_rec.id::text,
              'badgeName', badge_rec.name,
              'pointsAwarded', badge_rec.points,
              'isAutomatic', true,
              'evaluatedAt', now()::text
            )
          );
        END IF;
      END IF;
    END LOOP;
  END LOOP;
END;
$$;