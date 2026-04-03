'use client';

import { useState } from 'react';
import { UserWithExtras } from '@/types';
import { ProfileModal } from './profile-modal';
import { ProfileAvatar } from '@/components/shared/ProfileAvatar';

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
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

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
        disabled={disabled || isLoading}
        className="relative size-10 bg-white border-4 border-[#FFAB57]/85 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md disabled:hover:shadow-none"
      >
        {isLoading ? (
          <div className="h-full w-full rounded-full bg-gray-200 animate-pulse" />
        ) : user ? (
          <>
            <ProfileAvatar
              userId={user.id}
              userName={user.name}
              profilePictureUrl={user.profilePictureUrl}
              size="sm"
              showBorder={false}
              className="h-full w-full"
            />
            {isHovered && (
              <div className="absolute inset-0 bg-gray-400/40 rounded-full transition-opacity duration-200" />
            )}
          </>
        ) : (
          <>
            <span className="text-sm font-semibold text-[#730202]">?</span>
            {isHovered && (
              <div className="absolute inset-0 bg-gray-400/40 rounded-full transition-opacity duration-200" />
            )}
          </>
        )}
      </button>
      <ProfileModal open={modalOpen} onOpenChange={setModalOpen} user={user || null} />
    </div>
  );
}
