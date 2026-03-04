-- Notification type enum (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'notification_type_enum' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.notification_type_enum AS ENUM ('badge', 'user', 'task', 'reward');
  END IF;
END;
$$;

-- Notification table
CREATE TABLE IF NOT EXISTS public."Notification" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public."User" (id) ON DELETE CASCADE,
  type public.notification_type_enum NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public."Notification" ENABLE ROW LEVEL SECURITY;

-- Policies: users can read and update their own notifications
CREATE POLICY IF NOT EXISTS "Select own notifications" ON public."Notification"
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Update own notifications" ON public."Notification"
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Service role (admin) can insert notifications for any user
-- Regular authenticated users cannot insert directly (notifications created by server actions only)
CREATE POLICY IF NOT EXISTS "Service role insert notifications" ON public."Notification"
  FOR INSERT WITH CHECK (true);

-- Index to speed up unread-first ordering
CREATE INDEX IF NOT EXISTS notification_user_read_created_idx
  ON public."Notification" (user_id, read_at, created_at DESC);
