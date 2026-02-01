/**
 * User Modal Types & Utilities
 * ==============================
 * Shared interfaces and utilities for user management modals.
 */

export interface UserModalContextType {
  onImageUpload?: (userId: string, file: File, userName: string) => Promise<void>;
  onImageOptimisticPreview?: (preview: string) => void;
}

export interface UserModalState {
  isImageUploading: boolean;
  imageUploadProgress: number;
  imagePreview: string | null;
}

export const defaultUserModalState: UserModalState = {
  isImageUploading: false,
  imageUploadProgress: 0,
  imagePreview: null,
};
