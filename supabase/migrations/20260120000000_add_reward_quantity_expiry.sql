-- Add quantity and expiry_date columns to Reward table
ALTER TABLE "public"."Reward" 
ADD COLUMN IF NOT EXISTS "quantity" integer,
ADD COLUMN IF NOT EXISTS "expiry_date" timestamp with time zone;
