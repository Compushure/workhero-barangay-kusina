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
    <div className="min-h-screen bg-[#f2e1c9] px-2 py-4 sm:p-6 animate-in fade-in duration-500">
      <div className="w-full mx-auto">
        <ProfilePageClient userId={userid} />
      </div>
    </div>
  );
}


