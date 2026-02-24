-- Add available_month column to Reward table
-- This column stores the month number (1-12) when the reward is available
-- NULL means available all year round

ALTER TABLE public."Reward"
ADD COLUMN IF NOT EXISTS available_month INTEGER;

COMMENT ON COLUMN public."Reward".available_month IS 'Month number (1-12) when reward is available. NULL = available all year.';

-- Add check constraint to ensure month is between 1 and 12
ALTER TABLE public."Reward"
ADD CONSTRAINT reward_available_month_check 
CHECK (available_month IS NULL OR (available_month >= 1 AND available_month <= 12));
