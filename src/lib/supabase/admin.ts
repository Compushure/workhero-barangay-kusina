import { createClient } from '@supabase/supabase-js';
export const supabaseAdmin = createClient(
  // never provide these env on production for security reasons
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);
