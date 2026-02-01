'use client';

import { useState, useRef, useMemo, useCallback } from 'react';
import { User, Camera } from 'lucide-react';

interface ProfilePictureProps {
  profilePictureUrl?: string;
  userName: string;
  isOwnProfile: boolean;
  isLoading: boolean;
  onFileChange: (file: File) => Promise<void>;
}

export function ProfilePicture({
  profilePictureUrl,
  userName,
  isOwnProfile,
  isLoading,
  onFileChange,
}: ProfilePictureProps) {
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageError(false);
      try {
        await onFileChange(file);
        // Clear the input value to allow re-selecting the same file
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  }, [onFileChange]);

  // Add cache-busting timestamp to image URL to force refresh
  const imageUrlWithCacheBust = useMemo(() => {
    if (!profilePictureUrl) return undefined;
    const separator = profilePictureUrl.includes('?') ? '&' : '?';
    return `${profilePictureUrl}${separator}t=${Date.now()}`;
  }, [profilePictureUrl]);

  return (
    <div className="flex justify-center mb-8">
      <div className="relative group">
        <div className="h-32 w-32 bg-[#f2e1c9] rounded-full flex items-center justify-center overflow-hidden border-4 border-[#730202]/20 transition-all duration-300 group-hover:border-[#730202]/40">
          {imageUrlWithCacheBust && !imageError ? (
            <img
              src={imageUrlWithCacheBust}
              alt={`${userName} profile picture`}
              className="h-full w-full object-cover transition-all duration-300"
              onError={() => setImageError(true)}
              onLoad={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
            />
          ) : (
            <User className="h-16 w-16 text-[#730202]/40" />
          )}
        </div>
        {isOwnProfile && (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="absolute bottom-0 right-0 bg-[#730202] text-white p-2 rounded-full shadow-lg hover:bg-[#8b0003] transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50"
              title="Upload profile picture"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
