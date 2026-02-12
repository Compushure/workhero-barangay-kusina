-- Trigger to automatically award points when a badge is assigned to a user
-- This handles both manual badge assignments and automated badge evaluations

-- Create function to handle badge points awarding
CREATE OR REPLACE FUNCTION public.award_badge_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  badge_points integer;
BEGIN
  -- Fetch the points value from the badge being awarded
  SELECT points INTO badge_points
  FROM public."Badges"
  WHERE id = NEW.badge_id;

  -- If badge not found or has no points, just return
  IF badge_points IS NULL OR badge_points <= 0 THEN
    RETURN NEW;
  END IF;

  -- Update the user's points by adding the badge points
  UPDATE public."User"
  SET points = points + badge_points
  WHERE id = NEW.awarded_to;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists to avoid conflicts
DROP TRIGGER IF EXISTS badge_award_points_trigger ON public."UserBadges";

-- Create the trigger that fires AFTER INSERT on UserBadges
CREATE TRIGGER badge_award_points_trigger
AFTER INSERT ON public."UserBadges"
FOR EACH ROW
EXECUTE FUNCTION public.award_badge_points();
