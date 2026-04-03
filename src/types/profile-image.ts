/**
 * Profile Image Types
 * ===================
 * Centralized type definitions for profile image management
 */

export interface ProfileImageEvent {
  userId: string;
  timestamp: number;
  tempUrl?: string;
}

export interface ProfileImageState {
  exists: boolean;
  checking: boolean;
  error: boolean;
  key: number;
  previewUrl?: string;
}

export interface ProfileImageHookOptions {
  userId: string;
  profilePictureUrl?: string;
  enabled?: boolean;
}

export interface ProfileImageUploadOptions {
  userId: string;
  userName: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface ProfileImageDeleteOptions {
  userId: string;
  userName: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface ProfilePictureProps {
  profilePictureUrl?: string;
  userName: string;
  userId: string;
  isOwnProfile: boolean;
  isLoading: boolean;
  isDeleting?: boolean;
  onFileChange: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export interface ProfileImageAvatarProps {
  userId: string;
  userName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showFallback?: boolean;
  className?: string;
}
