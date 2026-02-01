/**
 * Image Crop Upload Component
 * ============================
 * Reusable component for uploading and cropping profile images.
 * Uses react-easy-crop for cropping functionality with circular crop area.
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Camera, Upload, X, RotateCw, CheckCircle2 } from 'lucide-react';
import type { UserModalContextType } from '@/lib/types/user-modal';
import { createClient } from '@/lib/supabase/client';

interface ImageCropUploadProps {
  currentImageUrl?: string;
  userName: string;
  userId?: string;
  onImageSelect: (croppedImage: File) => void;
  onImageUpload?: UserModalContextType['onImageUpload'];
  onImageClear?: (userId: string, userName: string) => Promise<void>;
  onImageClearLocal?: () => void;
  onUploadProgress?: (progress: number) => void;
  disabled?: boolean;
}

/**
 * Helper function to create image file from cropped area
 */
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> {
  const image = new Image();
  image.src = imageSrc;
  
  await new Promise((resolve) => {
    image.onload = resolve;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Set canvas size to the crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      resolve(blob);
    }, 'image/png');
  });
}

export function ImageCropUpload({ 
  currentImageUrl, 
  userName,
  userId,
  onImageSelect,
  onImageUpload,
  onImageClear,
  onImageClearLocal,
  onUploadProgress,
  disabled = false 
}: ImageCropUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageExists, setImageExists] = useState(false);
  const [checkingImage, setCheckingImage] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if image actually exists in storage
  useEffect(() => {
    async function checkImageExists() {
      if (!userId || !currentImageUrl) {
        setImageExists(false);
        return;
      }

      setCheckingImage(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase.storage
          .from('employees')
          .list(userId, {
            limit: 1,
            search: 'profile.png'
          });

        setImageExists(!error && data && data.length > 0);
      } catch (error) {
        console.error('Error checking image existence:', error);
        setImageExists(false);
      } finally {
        setCheckingImage(false);
      }
    }

    checkImageExists();

    // Listen for profile image deletion events (from other instances)
    const handleImageDeleted = (event: Event) => {
      const customEvent = event as CustomEvent<{ userId: string; timestamp: number }>;
      if (customEvent.detail.userId === userId) {
        console.log('Profile image deleted event received in ImageCropUpload');
        setImageExists(false);
        setCroppedPreview(null);
      }
    };

    window.addEventListener('profile-image-deleted', handleImageDeleted);

    return () => {
      window.removeEventListener('profile-image-deleted', handleImageDeleted);
    };
  }, [userId, currentImageUrl]);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (1MB limit to match Supabase)
    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      alert(`Image size must be less than 1MB. Your image is ${(file.size / 1024 / 1024).toFixed(2)}MB. Please compress the image and try again.`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setIsDialogOpen(true);
      setZoom(1);
      setRotation(0);
      setCrop({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleCropSave = async () => {
    if (!selectedImage || !croppedAreaPixels) return;

    try {
      const croppedBlob = await getCroppedImg(selectedImage, croppedAreaPixels);
      
      // Validate cropped image size (1MB limit)
      const maxSize = 1 * 1024 * 1024; // 1MB
      if (croppedBlob.size > maxSize) {
        alert(`Cropped image is too large (${(croppedBlob.size / 1024 / 1024).toFixed(2)}MB). Please zoom out or select a different image.`);
        return;
      }
      
      const croppedFile = new File([croppedBlob], 'profile.png', { type: 'image/png' });
      
      // Call the onImageSelect callback (always)
      onImageSelect(croppedFile);
      
      // Only upload immediately if userId exists (editing existing user)
      // For new users, upload happens after user creation in onAddUser
      if (onImageUpload && userId) {
        setIsUploading(true);
        setUploadSuccess(false);
        try {
          // Simulate upload progress
          const progressInterval = setInterval(() => {
            setUploadProgress((prev) => {
              if (prev >= 90) {
                clearInterval(progressInterval);
                return prev;
              }
              return prev + Math.random() * 30;
            });
          }, 200);

          await onImageUpload(userId, croppedFile, userName);
          
          clearInterval(progressInterval);
          setUploadProgress(100);
          setUploadSuccess(true);
          
          // Generate preview URL ONLY after successful upload
          const previewUrl = URL.createObjectURL(croppedBlob);
          setCroppedPreview(previewUrl);
          setImageExists(true); // Update state after successful upload
          
          // Close dialog after showing success
          setTimeout(() => {
            setIsDialogOpen(false);
            setSelectedImage(null);
            setUploadProgress(0);
            setUploadSuccess(false);
            setIsUploading(false);
          }, 1500);
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Failed to upload image. Please try again.');
          setIsUploading(false);
          setUploadProgress(0);
          // Don't update preview on error
        }
      } else {
        // For new users (no userId), generate preview and close dialog
        // Upload will happen after user is created
        const previewUrl = URL.createObjectURL(croppedBlob);
        setCroppedPreview(previewUrl);
        setIsDialogOpen(false);
        setSelectedImage(null);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearImage = async () => {
    if (currentImageUrl && userId && onImageClear) {
      setIsDeleting(true);
      try {
        await onImageClear(userId, userName);
        // Update state after successful deletion
        setImageExists(false);
        setCroppedPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onImageClearLocal?.();
      } catch (error) {
        console.error('Error deleting image:', error);
      } finally {
        setIsDeleting(false);
      }
    } else {
      // No server deletion needed, just clear local preview
      setCroppedPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onImageClearLocal?.();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <Avatar className="w-24 h-24 border-2 border-border">
          <AvatarImage src={croppedPreview || currentImageUrl} alt={userName} />
          <AvatarFallback className="bg-primary/10 text-primary text-lg">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="gap-2"
          >
            <Camera className="h-4 w-4" />
            {currentImageUrl ? 'Change Photo' : 'Upload Photo'}
          </Button>

          {(imageExists || croppedPreview) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearImage}
              disabled={disabled || checkingImage || isDeleting}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
              {isDeleting ? 'Removing...' : 'Remove'}
            </Button>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crop Profile Picture</DialogTitle>
            <DialogDescription>
              Adjust the image position, zoom, and rotation to get the perfect profile picture.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Crop Area */}
            <div className="relative w-full h-72 bg-muted rounded-lg overflow-hidden">
              {selectedImage && (
                <Cropper
                  image={selectedImage}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                />
              )}
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Zoom Control */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Zoom</Label>
                <Slider
                  value={[zoom]}
                  onValueChange={([value]) => setZoom(value)}
                  min={1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Rotation Control */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Rotation</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[rotation]}
                    onValueChange={([value]) => setRotation(value)}
                    min={0}
                    max={360}
                    step={1}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRotation((rotation + 90) % 360)}
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCropSave}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Upload className="h-4 w-4 mr-2" />
                Save & Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
