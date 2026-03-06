'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeNotificationToastClient } from './realtime-notification-toast';

export function RealtimeNotificationToastClientWrapper() {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (active) {
        setUserId(user?.id ?? null);
      }
    };

    loadUser();

    return () => {
      active = false;
    };
  }, [supabase]);

  if (!userId) return null;

  return <RealtimeNotificationToastClient userId={userId} />;
}
