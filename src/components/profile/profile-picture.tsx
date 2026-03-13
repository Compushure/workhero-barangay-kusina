'use client';

import { useRef, memo } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProfileImage } from '@/hooks/useProfileImage';
import { useAntiSpam } from '@/hooks/useAntiSpam';

interface ProfilePictureProps {
  profilePictureUrl?: string;
  userName: string;
  userId: string;
  isOwnProfile: boolean;
  isLoading: boolean;
  isDeleting?: boolean;
  onFileChange: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
  onOpenCropDialog?: () => void;
}

function ProfilePictureComponent({
  profilePictureUrl,
  userName,
  userId,
  isOwnProfile,
  isLoading,
  isDeleting = false,
  onFileChange,
  onDelete,
  onOpenCropDialog,
}: ProfilePictureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use optimized profile image hook
  const { imageUrl, exists: imageExists, checking: checkingImage, getInitials } = useProfileImage({
    userId,
    profilePictureUrl,
  });
  
  // Anti-spam protection for upload and delete actions
  const uploadAntiSpam = useAntiSpam({ cooldown: 1000, maxAttempts: 3 });
  const deleteAntiSpam = useAntiSpam({ cooldown: 1000, maxAttempts: 3 });

  const handleCameraClick = () => {
    // If crop dialog is available, open it directly
    if (onOpenCropDialog) {
      onOpenCropDialog();
    } else {
      // Fallback: direct file selection
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadAntiSpam.execute(async () => {
      await onFileChange(file);
    });
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !deleteAntiSpam.canExecute) return;
    
    await deleteAntiSpam.execute(async () => {
      await onDelete();
    });
  };

  const displayUrl = imageExists && imageUrl;

  return (
    <div className="flex flex-col items-center gap-6 mb-6">
      {/* Profile Picture Circle */}
      <div className="relative">
        <div className="h-32 w-32 bg-[var(--color-background-soft)] rounded-full flex items-center justify-center overflow-hidden border-4 border-accent/25">
          {checkingImage ? (
            <div className="animate-pulse text-accent/50 text-xl font-semibold">
              Loading...
            </div>
          ) : displayUrl ? (
            <img
              src={displayUrl}
              alt={`${userName} profile picture`}
              className="h-full w-full object-cover"
              loading="eager"
              onLoad={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
            />
          ) : (
            <span className="text-4xl font-semibold text-primary/60">
              {getInitials(userName)}
            </span>
          )}
        </div>
        
        {/* Camera button overlay */}
        {isOwnProfile && (
          <button
            onClick={handleCameraClick}
            disabled={isLoading || isDeleting || !uploadAntiSpam.canExecute}
            className="absolute bottom-0 right-0 bg-[var(--color-accent)] text-white p-2 rounded-full shadow-lg hover:bg-[var(--color-accent-secondary)] hover:shadow-xl disabled:bg-gray-400 disabled:opacity-60 disabled:cursor-not-allowed active:scale-90 cursor-pointer disabled:active:scale-100 transition-all duration-200"
            title={isLoading ? 'Uploading...' : 'Upload profile picture'}
          >
            <Camera className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const ProfilePicture = memo(ProfilePictureComponent, (prev, next) => {
  return (
    prev.userId === next.userId &&
    prev.userName === next.userName &&
    prev.profilePictureUrl === next.profilePictureUrl &&
    prev.isOwnProfile === next.isOwnProfile &&
    prev.isLoading === next.isLoading &&
    prev.isDeleting === next.isDeleting &&
    prev.onOpenCropDialog === next.onOpenCropDialog
  );
});

ProfilePicture.displayName = 'ProfilePicture';
