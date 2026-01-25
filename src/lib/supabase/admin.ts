import { createClient } from '@supabase/supabase-js';
if(!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.SUPABASE_URL){
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL environment variables');
  }
export const supabaseAdmin =  createClient(
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
