'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo, useTransition } from 'react';
import { UserWithExtras } from '@/types';
import { ProfileModal } from './profile-modal';

interface ProfilePicProps {
  user?: UserWithExtras | null;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function ProfilePic({
  user,
  onClick,
  disabled = false,
  isLoading = false,
}: ProfilePicProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [hasImage, setHasImage] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Add cache-busting timestamp to image URL to force refresh when profile picture changes
  const imageUrlWithCacheBust = useMemo(() => {
    if (!user?.profilePictureUrl) return undefined;
    const separator = user.profilePictureUrl.includes('?') ? '&' : '?';
    return `${user.profilePictureUrl}${separator}t=${Date.now()}`;
  }, [user?.profilePictureUrl]);

  // Get initials from user name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProfileClick = () => {
    if (disabled) return;
    if (onClick) {
      onClick();
    } else if (user) {
      setModalOpen(true);
    }
  };

  return (
    <div>
      <button
        onClick={handleProfileClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isPending || disabled || isLoading}
        className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md disabled:hover:shadow-none"
      >
        {isLoading ? (
          <div className="h-full w-full rounded-full bg-gray-200 animate-pulse" />
        ) : imageUrlWithCacheBust && hasImage ? (
          <>
            <img
              src={imageUrlWithCacheBust}
              alt={user?.name || 'User profile'}
              className="w-full h-full rounded-full object-cover"
              onError={() => setHasImage(false)}
            />
            {isHovered && !isPending && (
              <div className="absolute inset-0 bg-gray-400/40 rounded-full transition-opacity duration-200" />
            )}
          </>
        ) : (
          <>
            <span className="text-sm font-semibold text-[#730202] font-medium">
              {user?.name ? getInitials(user.name) : '?'}
            </span>
            {isHovered && !isPending && (
              <div className="absolute inset-0 bg-gray-400/40 rounded-full transition-opacity duration-200" />
            )}
          </>
        )}
      </button>
      <ProfileModal open={modalOpen} onOpenChange={setModalOpen} user={user || null} />
    </div>
  );
}
