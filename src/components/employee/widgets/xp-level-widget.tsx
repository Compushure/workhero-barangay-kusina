'use client';

import { useEffect, useMemo, useState } from 'react';
import { useGetEmployeeXP, useGetXPRequiredForNextLevel } from '@/hooks/tanstack';
import { handleFetchEmployeeXP } from '@/action-handlers/employee/stats';
import type { EmployeeXP } from '@/types';
import { XPProgressSkeleton } from './widget-skeletons';
import { useGetSessionUser } from '@/hooks/tanstack/queries/userQueries';
import { ProfileModal } from '@/components/sidebar/profile-modal';

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

  const [hasImage, setHasImage] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { data: user, isLoading: userLoading } = useGetSessionUser();

  // const [xpData, setXpData] = useState<EmployeeXP | null>(null);
  // const [loading, setLoading] = useState(true);
  // useEffect(() => {
  //   async function fetchData() {
  //     setLoading(true);
  //     const xp = await handleFetchEmployeeXP();
  //     setXpData(xp);
  //     setLoading(false);
  //   }
  //   fetchData();
  // }, []);

  const imageUrlWithCacheBust = useMemo(() => {
    if (!user?.profilePictureUrl) return undefined;
    const separator = user.profilePictureUrl.includes('?') ? '&' : '?';
    const version = user?.id ?? 'v1';
    return `${user.profilePictureUrl}${separator}v=${encodeURIComponent(version)}`;
  }, [user?.profilePictureUrl, user?.id]);

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
      <div className="w-[clamp(12rem,70vw,20rem)] wood-panel rounded-lg shadow-md px-1.5 sm:px-2 pt-1 pb-1.5 sm:pb-2 flex items-center gap-1.5 sm:gap-2">
        <div
          onClick={() => setModalOpen(true)}
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center wood-panel shrink-0 overflow-hidden cursor-pointer hover:scale-105 transition-transform shadow-[2px_2px_2px_#000] shadow-[#47331F]/50"
        >
          {imageUrlWithCacheBust && hasImage ? (
            <img
              src={imageUrlWithCacheBust}
              alt={user?.name || 'User profile'}
              className="h-full w-full rounded-full object-cover"
              onError={() => setHasImage(false)}
            />
          ) : (
            <span className="text-sm sm:text-base text-muted">{initials}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="w-full flex items-center justify-between text-sm sm:text-lg md:text-xl text-yellow-500 gap-1">
            <span className="flex items-center gap-1 sm:gap-2 shrink-0">
              <span className="text-xs sm:text-sm">⭐</span>
              <span className="whitespace-nowrap">Lvl {currentLevel}</span>
            </span>
            <span className="text-xs sm:text-sm md:text-base whitespace-nowrap">
              {currentXP} / {nextLevelXP}
            </span>
          </div>

          <div className="w-full pt-0.5">
            <div className="h-3 sm:h-4 md:h-5 bg-[#273A27] border-2 border-[#47331F] rounded-sm overflow-hidden">
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
