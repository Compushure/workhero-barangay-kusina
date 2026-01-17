'use server';

import { createClient } from '@/lib/supabase/server';
import { VerificationRequest } from '@/types/manager-verification-req';

import { ServerActionResponse } from '@/lib/utils/safe-action';
import { UserWithExtras } from '@/components/admin/user-card';

// fo
// export async function fetchInSessionUserInfo(): Promise<ServerActionResponse<UserWithExtras>> {
//   const supabase = await createClient();

 
// }