-- Add month_name column to Reward table
-- This will store the month name (e.g., "January", "February") based on available_date

ALTER TABLE public."Reward"
ADD COLUMN IF NOT EXISTS month_name TEXT;

-- Add check constraint to ensure only valid month names
ALTER TABLE public."Reward"
ADD CONSTRAINT valid_month_name CHECK (
  month_name IS NULL OR 
  month_name IN (
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  )
);

-- Create index for faster filtering by month_name
CREATE INDEX IF NOT EXISTS idx_reward_month_name ON public."Reward"(month_name);

-- Create a function to automatically set month_name when available_date is set
CREATE OR REPLACE FUNCTION set_month_name_from_date()
RETURNS TRIGGER AS $$
BEGIN
  -- If available_date is set, extract the month name
  IF NEW.available_date IS NOT NULL THEN
    NEW.month_name := TO_CHAR(NEW.available_date, 'Month');
    -- Trim whitespace from month name
    NEW.month_name := TRIM(NEW.month_name);
  ELSE
    -- If no date, clear month_name
    NEW.month_name := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set month_name on INSERT or UPDATE
DROP TRIGGER IF EXISTS trigger_set_month_name ON public."Reward";
CREATE TRIGGER trigger_set_month_name
  BEFORE INSERT OR UPDATE OF available_date ON public."Reward"
  FOR EACH ROW
  EXECUTE FUNCTION set_month_name_from_date();

-- Update existing records to set month_name based on their available_date
UPDATE public."Reward"
SET month_name = TRIM(TO_CHAR(available_date, 'Month'))
WHERE available_date IS NOT NULL;

-- Update existing records to set month_name based on available_month if available_date is NULL
UPDATE public."Reward"
SET month_name = CASE available_month
  WHEN 1 THEN 'January'
  WHEN 2 THEN 'February'
  WHEN 3 THEN 'March'
  WHEN 4 THEN 'April'
  WHEN 5 THEN 'May'
  WHEN 6 THEN 'June'
  WHEN 7 THEN 'July'
  WHEN 8 THEN 'August'
  WHEN 9 THEN 'September'
  WHEN 10 THEN 'October'
  WHEN 11 THEN 'November'
  WHEN 12 THEN 'December'
END
WHERE available_date IS NULL AND available_month IS NOT NULL;
