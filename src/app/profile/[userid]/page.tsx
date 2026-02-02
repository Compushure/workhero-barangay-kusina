/**
 * User Profile Page (Server Component)
 * ====================================
 * Dynamic route for viewing user profiles.
 * Accessible to any authenticated user (all roles).
 * Suspense boundary is handled by ProfilePageClient internally.
 */

import { protectSessionRoute } from '@/actions/auth';
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
    <div className="min-h-screen bg-[#f2e1c9] p-6 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto">
        <ProfilePageClient userId={userid} />
      </div>
    </div>
  );
}


