'use client';

import { useEffect, useMemo, useState } from 'react';
import { handleFetchEmployeeXP } from '@/action-handlers/employee/stats';
import type { EmployeeXP } from '@/types';
import { XPProgressSkeleton } from './widget-skeletons';
import { useGetSessionUser } from '@/hooks/tanstack/queries/userQueries';
import { ProfileModal } from '@/components/sidebar/profile-modal';

export default function XPProgress() {
  const [xpData, setXpData] = useState<EmployeeXP | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasImage, setHasImage] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { data: user, isLoading: userLoading } = useGetSessionUser();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const xp = await handleFetchEmployeeXP();
      setXpData(xp);
      setLoading(false);
    }
    fetchData();
  }, []);

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

  const currentXP = xpData?.currentXP ?? 0;
  const currentLevel = xpData?.level ?? 1;
  const maxXp = 100; // matches screenshot

  if (userLoading) {
    return <XPProgressSkeleton />;
  }

  return (
    <>
      <div className="w-50 sm:w-100 max-w-75 sm:max-w-75 wood-panel rounded-lg shadow-md px-2 pt-1 pb-2 flex items-center gap-2">
        <div
          onClick={() => setModalOpen(true)}
          className="h-12 w-12 rounded-full flex items-center justify-center wood-panel shrink-0 overflow-hidden cursor-pointer hover:scale-105 transition-transform shadow-[2px_2px_2px_#000] shadow-[#47331F]/50"
        >
          {imageUrlWithCacheBust && hasImage ? (
            <img
              src={imageUrlWithCacheBust}
              alt={user?.name || 'User profile'}
              className="h-full w-full rounded-full object-cover"
              onError={() => setHasImage(false)}
            />
          ) : (
            <span className="text-base text-muted">{initials}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="w-full flex items-center justify-between text-lg sm:text-xl text-yellow-500">
            <span className="flex items-center gap-2">
              <span className="text-sm">⭐</span>
              <span>Lvl {currentLevel}</span>
            </span>
            <span className="text-base sm:text-lg">
              XP: {currentXP}/{maxXp}
            </span>
          </div>

          <div className="w-full pt-0.5">
            <div className="h-4 sm:h-5 bg-[#273A27] border-2 border-[#47331F] rounded-sm overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${(currentXP / maxXp) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <ProfileModal open={modalOpen} onOpenChange={setModalOpen} user={user || null} />
    </>
  );
}
