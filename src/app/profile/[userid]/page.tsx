/**
 * User Profile Page (Server Component)
 * ====================================
 * Dynamic route for viewing user profiles.
 * Accessible to any authenticated user (all roles).
 * Suspense boundary is handled by ProfilePageClient internally.
 */

import { protectSessionRoute } from '@/actions/shared/auth';
import { ProfilePageClient } from '@/components/profile/profile-page-client';

interface ProfilePageProps {
  params: Promise<{
    userid: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userid } = await params;
  await protectSessionRoute(userid);

  return (
    <div className="min-h-svh bg-[#f2e1c9] px-1 pt-2 pb-8 sm:px-4 sm:py-6 lg:px-8 lg:py-8 animate-in fade-in duration-500">
      <div className="w-full mx-auto max-w-7xl 2xl:max-w-440">
        <ProfilePageClient userId={userid} />
      </div>
    </div>
  );
}


