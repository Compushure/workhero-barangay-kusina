'use client';

import { useState, useEffect, useMemo } from 'react';
import { useGetSessionUser } from '@/hooks/tanstack/queries/userQueries';
import { ProfileLevelSkeleton } from './widget-skeletons';
import { ProfileModal } from '@/components/sidebar/profile-modal';

export default function ProfileLevelCard() {
  const { data: user, isLoading: userLoading } = useGetSessionUser();
  const [hasImage, setHasImage] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

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

  const name = user?.name ?? 'Employee';
  const email = user?.email ?? 'No email address';

  const isLoading = userLoading;

  if (isLoading) {
    return <ProfileLevelSkeleton />;
  }

  return (
    <>
      <div className="inline-flex w-auto max-w-full items-center wood-panel rounded-lg shadow-md p-2">
        {/* Avatar Circle with onClick */}
        <div
          onClick={() => setModalOpen(true)}
          className="w-12 h-12 rounded-full flex items-center justify-center wood-panel shrink-0 mr-3 overflow-hidden cursor-pointer hover:scale-105 transition-transform shadow-[2px_2px_2px_#000] shadow-[#47331F]/50"
        >
          {imageUrlWithCacheBust && hasImage ? (
            <img
              src={imageUrlWithCacheBust}
              alt={user?.name || 'User profile'}
              className="w-full h-full rounded-full object-cover"
              onError={() => setHasImage(false)}
            />
          ) : (
            <span className="text-base text-muted">{initials}</span>
          )}
        </div>

        {/* Profile name + email */}
        <div className="flex flex-col min-w-0">
          <span className="text-lg sm:text-xl font-semibold text-muted truncate tracking-wide">{name}</span>
          <span className="text-sm sm:text-base font-medium text-muted/75 truncate">{email}</span>
        </div>
      </div>

      {/* Modal */}
      <ProfileModal open={modalOpen} onOpenChange={setModalOpen} user={user || null} />
    </>
  );
}
