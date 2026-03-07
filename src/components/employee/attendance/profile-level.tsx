'use client';

import { useState, useEffect, useMemo } from 'react';
import { handleFetchEmployeeXP } from '@/action-handlers/employee/stats';
import { useGetSessionUser } from '@/hooks/tanstack/queries/userQueries';
import type { EmployeeXP } from '@/types';
import { ProfileLevelSkeleton } from './skeletons';
import { ProfileModal } from '@/components/sidebar/profile-modal';

export default function ProfileLevelCard() {
  const [xpData, setXpData] = useState<EmployeeXP | null>(null);
  const { data: user, isLoading: userLoading } = useGetSessionUser();
  const [hasImage, setHasImage] = useState(true);
  const [loadingXP, setLoadingXP] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function fetchXP() {
      setLoadingXP(true);
      const data = await handleFetchEmployeeXP();
      setXpData(data);
      setLoadingXP(false);
    }
    fetchXP();
  }, []);

  const imageUrlWithCacheBust = useMemo(() => {
    if (!user?.profilePictureUrl) return undefined;
    const separator = user.profilePictureUrl.includes('?') ? '&' : '?';
    const version = user?.id ?? 'v1';
    return `${user.profilePictureUrl}${separator}v=${encodeURIComponent(version)}`;
  }, [user?.profilePictureUrl, user?.id]);

  const initials = (() => {
    if (!user?.name) return 'U';
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  })();

  const level = xpData?.level ?? 1;
  const name = user?.name ?? 'Employee';

  const isLoading = userLoading || loadingXP;

  if (isLoading) {
    return <ProfileLevelSkeleton />;
  }

  return (
    <>
      <div className="inline-flex w-full sm:w-auto max-w-sm sm:max-w-none items-center bg-[#765332] border-3 border-[#47331F] rounded-lg shadow-md p-2">
        {/* Avatar Circle with onClick */}
        <div
          onClick={() => setModalOpen(true)}
          className="w-12 h-12 rounded-full bg-[#E89C30] flex items-center justify-center border-2 border-[#47331F] shrink-0 mr-3 overflow-hidden cursor-pointer hover:scale-105 transition-transform shadow-[4px_4px_0px_#000] shadow-[#47331F]/50"
        >
          {imageUrlWithCacheBust && hasImage ? (
            <img
              src={imageUrlWithCacheBust}
              alt={user?.name || 'User profile'}
              className="w-full h-full rounded-full object-cover"
              onError={() => setHasImage(false)}
            />
          ) : (
            <span className="text-base text-[#F5E8D6]">{initials}</span>
          )}
        </div>

        {/* Profile name + level */}
        <div className="flex flex-col min-w-0">
          <span className="text-lg sm:text-xl font-semibold text-[#F5E8D6] truncate">{name}</span>
          <span className="text-base sm:text-lg font-medium text-[#9E9985]">Lv. {level}</span>
        </div>
      </div>

      {/* Modal */}
      <ProfileModal open={modalOpen} onOpenChange={setModalOpen} user={user || null} />
    </>
  );
}
