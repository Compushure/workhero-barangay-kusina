-- Add redeeming_limit column to Reward table
-- This column sets a maximum number of times each employee can redeem this reward
ALTER TABLE "public"."Reward" 
ADD COLUMN IF NOT EXISTS "redeeming_limit" integer;

COMMENT ON COLUMN "public"."Reward"."redeeming_limit" IS 'Maximum number of times an employee can redeem this reward. NULL means no limit.';
