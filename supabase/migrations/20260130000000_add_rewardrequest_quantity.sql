-- Add quantity column to RewardRequest table
-- This column tracks how many units of a reward are being requested
ALTER TABLE "public"."RewardRequest" 
ADD COLUMN IF NOT EXISTS "quantity" integer DEFAULT 1 NOT NULL;

COMMENT ON COLUMN "public"."RewardRequest"."quantity" IS 'Number of reward items being requested in this redemption request';

-- Add remarks column to store acceptance/decline notes
ALTER TABLE "public"."RewardRequest" 
ADD COLUMN IF NOT EXISTS "remarks" text;

COMMENT ON COLUMN "public"."RewardRequest"."remarks" IS 'Optional remarks from HR when approving or declining the request';

-- Update any existing records to have quantity = 1 if they have NULL
UPDATE "public"."RewardRequest" 
SET "quantity" = 1 
WHERE "quantity" IS NULL;
