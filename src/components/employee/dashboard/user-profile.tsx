'use client';

import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { UserWithExtras } from '@/types';
import { ProfileModal } from '../modals/profile-modal';

interface ProfilePicProps {
  user?: UserWithExtras | null;
  onClick?: () => void;
}

export function ProfilePic({ user, onClick }: ProfilePicProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [hasImage, setHasImage] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Add cache-busting timestamp to image URL to force refresh when profile picture changes
  const imageUrlWithCacheBust = useMemo(() => {
    if (!user?.profilePictureUrl) return undefined;
    const separator = user.profilePictureUrl.includes('?') ? '&' : '?';
    return `${user.profilePictureUrl}${separator}t=${Date.now()}`;
  }, [user?.profilePictureUrl]);

  const handleProfileClick = () => {
    if (onClick) {
      onClick();
    } else if (user) {
      setModalOpen(true);
    }
  };

  return (
    <div>
      <div
        onClick={handleProfileClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-14 h-14 bg-white rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all duration-200 group"
      >
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
            <User size={24} className="text-[#690003]" />
            {isHovered && (
              <div className="absolute inset-0 bg-gray-400/40 rounded-full transition-opacity duration-200" />
            )}
          </>
        )}
      </div>
      <ProfileModal open={modalOpen} onOpenChange={setModalOpen} user={user || null} />
    </div>
  );
}
