BEGIN;

ALTER TABLE public."Reward"
  RENAME COLUMN available_month TO availability_interval;

ALTER TABLE public."Reward"
  ADD COLUMN IF NOT EXISTS availability_anchor_date date;

UPDATE public."Reward"
SET availability_anchor_date = CASE
  WHEN month_name LIKE 'anchor:%' THEN SUBSTRING(month_name FROM 8)::date
  WHEN month_name ~ '^\d{4}-\d{2}-\d{2}$' THEN month_name::date
  ELSE NULL
END
WHERE availability_anchor_date IS NULL;

UPDATE public."Reward"
SET availability_interval = LOWER(availability_interval)
WHERE availability_interval IS NOT NULL;

UPDATE public."Reward"
SET availability_interval = NULL
WHERE availability_interval IS NOT NULL
  AND LOWER(availability_interval) NOT IN ('weekly', 'monthly', 'yearly');

ALTER TABLE public."Reward"
  DROP CONSTRAINT IF EXISTS reward_availability_interval_check;

ALTER TABLE public."Reward"
  ADD CONSTRAINT reward_availability_interval_check
  CHECK (
    availability_interval IS NULL
    OR LOWER(availability_interval) IN ('weekly', 'monthly', 'yearly')
  );

ALTER TABLE public."Reward"
  DROP COLUMN IF EXISTS month_name;

COMMENT ON COLUMN public."Reward".availability_interval
  IS 'Availability interval for rewards: weekly, monthly, yearly, or null for always available.';

COMMENT ON COLUMN public."Reward".availability_anchor_date
  IS 'Anchor date used to evaluate weekly/monthly/yearly interval visibility.';

COMMIT;
