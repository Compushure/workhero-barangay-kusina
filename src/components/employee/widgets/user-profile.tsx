'use client';

import { useState, useMemo, useEffect } from 'react';
import { UserWithExtras } from '@/types';
import { ProfileModal } from '@/components/sidebar/profile-modal';
import { useGetSessionUser } from '@/hooks/tanstack/queries/userQueries';

export function ProfilePic() {
  const [isHovered, setIsHovered] = useState(false);
  const [hasImage, setHasImage] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Fetch current session user
  const { data: user } = useGetSessionUser();

  // Reset hasImage when profilePictureUrl changes
  useEffect(() => {
    setHasImage(true);
  }, [user?.profilePictureUrl]);

  // Add cache-busting timestamp to image URL to force refresh when profile picture changes
  const imageUrlWithCacheBust = useMemo(() => {
    if (!user?.profilePictureUrl) return undefined;
    const separator = user.profilePictureUrl.includes('?') ? '&' : '?';
    return `${user.profilePictureUrl}${separator}t=${Date.now()}`;
  }, [user?.profilePictureUrl]);

  const handleProfileClick = () => {
    if (user) {
      setShowProfileModal(true);
    }
  };

  // Compute initials: first letter of first two words, or first two letters of one word
  const initials = (() => {
    if (!user?.name) return 'U';
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  })();

  return (
    <>
      {/* Avatar Circle */}
      <div
        className="cursor-pointer"
        onClick={handleProfileClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-14 h-14 bg-white shadow-2xl rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ease-in-out group">
          {imageUrlWithCacheBust && hasImage ? (
            <>
              <img
                src={imageUrlWithCacheBust}
                alt={user?.name || 'User profile'}
                className="w-full h-full rounded-full object-cover"
                onError={() => setHasImage(false)}
              />
              {isHovered && (
                <div className="absolute inset-0 bg-gray-400/40 rounded-full transition-opacity duration-200" />
              )}
            </>
          ) : (
            <>
              <span className="text-lg font-bold text-[#690003]">
                {initials}
              </span>
              {isHovered && (
                <div className="absolute inset-0 bg-gray-400/40 rounded-full transition-opacity duration-200" />
              )}
            </>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        user={user ?? null}
      />
    </>
  );
}
