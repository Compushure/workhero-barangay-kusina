'use client';

import { useState } from 'react';
import { useGetEmployeeXP, useGetXPRequiredForNextLevel } from '@/hooks/tanstack';
import { XPProgressSkeleton } from './widget-skeletons';
import { useGetSessionUser } from '@/hooks/tanstack/queries/userQueries';
import { ProfileModal } from '@/components/sidebar/profile-modal';
import { ProfileAvatar } from '@/components/shared/ProfileAvatar';

export default function XPProgress() {
  const { data: xpData, isLoading: xpLoading } = useGetEmployeeXP();
  const currentLevel = xpData?.level ?? 1;
  const { data: requiredXP, isLoading: requiredLoading } = useGetXPRequiredForNextLevel(
    xpData?.level ?? 1
  );

  const loading = xpLoading || requiredLoading;

  const currentXP = xpData?.currentXP ?? 0;
  const nextLevelXP = requiredXP ?? 100;
  const progressPercent = nextLevelXP > 0 ? Math.min((currentXP / nextLevelXP) * 100, 100) : 0;

  const [modalOpen, setModalOpen] = useState(false);
  const { data: user, isLoading: userLoading } = useGetSessionUser();

  if (loading) {
    // ✅ Show skeleton while loading
    return <XPProgressSkeleton />;
  }

  const initials = (() => {
    if (!user?.name) return 'U';
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  })();

  // const currentXP = xpData?.currentXP ?? 0;
  // const currentLevel = xpData?.level ?? 1;
  // const maxXp = 100; // matches screenshot

  if (userLoading) {
    return <XPProgressSkeleton />;
  }

  return (
    <>
      <div className="flex h-12 items-center gap-1.5 rounded-lg wood-panel px-1.5 py-1 sm:h-13 sm:gap-2 sm:px-2 sm:py-1.5 md:h-14 w-[clamp(12rem,25vw,18rem)] md:w-[clamp(15rem,30vw,21rem)] md:px-2.5">
        <div
          onClick={() => setModalOpen(true)}
          className="flex size-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full wood-panel shadow-[2px_2px_2px_#000] shadow-[#47331F]/50 transition-transform hover:scale-105 hover:border-orange-400/50 sm:size-11 md:size-12"
        >
          {user ? (
            <ProfileAvatar
              userId={user.id}
              userName={user.name}
              profilePictureUrl={user.profilePictureUrl}
              size="sm"
              showBorder={false}
              className="h-full w-full"
            />
          ) : (
            <span className="text-sm sm:text-base text-muted">{initials}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex w-full items-center justify-between gap-1 text-yellow-500 leading-none">
            <span className="flex items-center gap-1 sm:gap-2 shrink-0">
              <span className="text-[10px] sm:text-xs">⭐</span>
              <span className="whitespace-nowrap text-sm md:text-base">Lvl {currentLevel}</span>
            </span>
            <span className="whitespace-nowrap text-xs md:text-sm">
              {currentXP} / {nextLevelXP}
            </span>
          </div>

          <div className="w-full pt-0.5">
            <div className="overflow-hidden rounded-sm border-2 border-[#47331F] bg-[#273A27] h-2.5 md:h-4">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <ProfileModal open={modalOpen} onOpenChange={setModalOpen} user={user || null} />
    </>
  );
}
