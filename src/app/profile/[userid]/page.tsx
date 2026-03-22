/**
 * User Profile Page (Server Component)
 * ====================================
 * Dynamic route for viewing user profiles.
 * Accessible to any authenticated user (all roles).
 * Suspense boundary is handled by ProfilePageClient internally.
 */

import Image from 'next/image';
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
    <div className="relative min-h-svh overflow-hidden bg-[#f2e1c9] animate-in fade-in duration-500">
      <Image
        src="/assets/home/hero-bg.png"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="pointer-events-none absolute inset-0 object-cover opacity-[0.18] mix-blend-multiply"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(242,159,74,0.18),transparent_38%),linear-gradient(180deg,rgba(242,225,201,0.56),rgba(255,247,238,0.24)_42%,rgba(224,124,36,0.12)_100%)]" />

      <div className="relative z-10 px-1 pt-2 pb-8 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
        <div className="w-full mx-auto max-w-7xl 2xl:max-w-440">
          <ProfilePageClient userId={userid} />
        </div>
      </div>
    </div>
  );
}


