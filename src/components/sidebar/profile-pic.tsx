'use client';

import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { UserWithExtras } from '@/types';

interface ProfilePicProps {
  user?: UserWithExtras | null;
  onClick?: () => void;
}

export function ProfilePic({ user, onClick }: ProfilePicProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [hasImage, setHasImage] = useState(true);

  const handleProfileClick = () => {
    if (onClick) {
      onClick();
    } else if (user) {
      router.push(`/profile?userid=${user.id}`);
    }
  };

  return (
    <div
      onClick={handleProfileClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all duration-200 group"
    >
      {user?.profilePictureUrl && hasImage ? (
        <>
          <img
            src={user.profilePictureUrl}
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
  );
}
