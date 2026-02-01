-- Remove redundant requested_items column from RewardRequest table
-- The reward name is already available via the foreign key relationship with the Reward table
-- This column duplicates data and can lead to inconsistencies

ALTER TABLE "public"."RewardRequest" 
DROP COLUMN IF EXISTS "requested_items";

COMMENT ON TABLE "public"."RewardRequest" IS 'Reward redemption requests. Reward details are fetched via the reward_id foreign key to avoid data duplication.';
