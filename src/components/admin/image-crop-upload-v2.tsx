/**
 * Image Crop Upload Component (Optimized)
 * ========================================
 * Reusable component for uploading and cropping profile images.
 * Uses react-easy-crop for cropping functionality with circular crop area.
 * Features: Compressed modal, remove picture option
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Upload, X, RotateCw } from 'lucide-react';
import type { UserModalContextType } from '@/lib/types/user-modal';

interface ImageCropUploadProps {
  currentImageUrl?: string;
  userName: string;
  userId?: string;
  onImageSelect: (croppedImage: File) => void;
  onImageUpload?: UserModalContextType['onImageUpload'];
  onImageClear?: (userId: string, userName: string) => Promise<void>;
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
    throw new Error('No 2d context');
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

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

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
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
      const croppedFile = new File([croppedBlob], 'profile.png', { type: 'image/png' });
      
      // Generate preview URL for optimistic update
      const previewUrl = URL.createObjectURL(croppedBlob);
      setCroppedPreview(previewUrl);
      
      // Call the onImageSelect callback
      onImageSelect(croppedFile);
      
      // If onImageUpload callback is provided and we have userId, handle the upload
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
          setIsUploading(false);
          setUploadProgress(0);
        }
      } else {
        // Just close the dialog if no upload handler
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
    setZoom(1);
    setRotation(0);
    setCrop({ x: 0, y: 0 });
    setCroppedAreaPixels(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleClearImage = async () => {
    if (!userId || !onImageClear) return;
    
    if (window.confirm('Are you sure you want to remove this profile picture?')) {
      try {
        await onImageClear(userId, userName);
        setCroppedPreview(null);
      } catch (error) {
        console.error('Error clearing image:', error);
      }
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <Avatar className="w-24 h-24 border-2 border-border">
          <AvatarImage src={croppedPreview || currentImageUrl} alt={userName} />
          <AvatarFallback className="bg-accent/10 text-foreground text-lg">
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
          
          {currentImageUrl && userId && onImageClear && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearImage}
              disabled={disabled}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
              Remove
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
            {/* Crop Area - Reduced height */}
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
                disabled={isUploading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Save & Upload'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
