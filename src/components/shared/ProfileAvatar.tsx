/**
 * Profile Avatar Component
 * =========================
 * Reusable, optimized avatar component with automatic image loading,
 * fallback to initials, and event-driven updates.
 */

'use client';

import { memo } from 'react';
import { useProfileImage } from '@/hooks/useProfileImage';
import { cn } from '@/lib/utils';

interface ProfileAvatarProps {
  userId: string;
  userName: string;
  profilePictureUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBorder?: boolean;
}

const sizeClasses = {
  xs: 'h-8 w-8 text-xs',
  sm: 'h-10 w-10 text-sm',
  md: 'h-16 w-16 text-base',
  lg: 'h-24 w-24 text-xl',
  xl: 'h-32 w-32 text-2xl',
};

const initialsSizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-4xl',
};

function ProfileAvatarComponent({
  userId,
  userName,
  profilePictureUrl,
  size = 'md',
  className,
  showBorder = true,
}: ProfileAvatarProps) {
  const profileImageState = useProfileImage({
    userId,
    profilePictureUrl,
  });
  
  const { imageUrl, exists, checking, getInitials } = profileImageState;

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center overflow-hidden transition-all duration-300',
        sizeClasses[size],
        showBorder && 'border-4 border-primary/20',
        className
      )}
    >
      {imageUrl && exists && !checking ? (
        <img
          src={imageUrl}
          alt={`${userName}'s profile`}
          className="h-full w-full object-cover"
          loading="lazy"
          onLoad={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-primary/10">
          <span className={cn('font-semibold text-primary/60', initialsSizeClasses[size])}>
            {getInitials(userName)}
          </span>
        </div>
      )}
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const ProfileAvatar = memo(ProfileAvatarComponent, (prev, next) => {
  return (
    prev.userId === next.userId &&
    prev.userName === next.userName &&
    prev.profilePictureUrl === next.profilePictureUrl &&
    prev.size === next.size &&
    prev.className === next.className &&
    prev.showBorder === next.showBorder
  );
});

ProfileAvatar.displayName = 'ProfileAvatar';
