import { createClient } from '@/lib/supabase/server';
import { RealtimeNotificationToastClient } from './realtime-notification-toast';

export async function RealtimeNotificationToast() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return <RealtimeNotificationToastClient userId={user.id} />;
}
