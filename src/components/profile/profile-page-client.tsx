'use client';

import { useRouter } from 'next/navigation';
import { useCallback, Suspense, useState, memo, useTransition } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ProfileHeader } from './profile-header';
import { ProfilePicture } from './profile-picture';
import { ProfileCard } from './profile-card';
import { RecentBadges } from './recent-badges';
import { ImageCropUpload } from '@/components/admin/image-crop-upload';
import { useGetUserProfile } from '@/hooks/tanstack/queries/profileQueries';
import { useGetSessionUser } from '@/hooks/tanstack/queries/userQueries';
import { useUploadOwnProfilePicture, useDeleteOwnProfilePicture } from '@/hooks/tanstack/mutations/profileMutations';
import { useAntiSpam } from '@/hooks/useAntiSpam';

interface ProfilePageClientProps {
  userId: string;
}

function ProfileLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}

export function ProfilePageClient({ userId }: ProfilePageClientProps) {
  return (
    <Suspense fallback={<ProfileLoadingSkeleton />}>
      <ProfilePageClientContent userId={userId} />
    </Suspense>
  );
}

function ProfilePageClientContent({ userId }: ProfilePageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null);
  const [showCropDialog, setShowCropDialog] = useState(false);
  
  const { data: profile, isLoading } = useGetUserProfile(userId);
  const uploadPicture = useUploadOwnProfilePicture(userId);
  const deletePicture = useDeleteOwnProfilePicture(userId);
  
  // Anti-spam protection for mutations
  const uploadAntiSpam = useAntiSpam({ cooldown: 1500, maxAttempts: 3 });
  const deleteAntiSpam = useAntiSpam({ cooldown: 1500, maxAttempts: 3 });

  // Route is already protected by protectSessionRoute(userId) on the server
  // So we can safely assume this is the user's own profile
  const isOwnProfile = true;

  const handleImageSelect = useCallback((croppedImage: File) => {
    setSelectedProfileImage(croppedImage);
    setShowCropDialog(false);
    
    // Upload immediately after crop
    if (uploadAntiSpam.canExecute) {
      uploadAntiSpam.execute(async () => {
        try {
          startTransition(() => {
            uploadPicture.mutate(croppedImage);
          });
        } catch (error) {
          console.error('Error uploading cropped image:', error);
        }
      });
    }
  }, [uploadPicture, uploadAntiSpam]);

  const handleFileChange = useCallback(async (file: File) => {
    if (uploadAntiSpam.canExecute) {
      await uploadAntiSpam.execute(async () => {
        try {
          await uploadPicture.mutateAsync(file);
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      });
    }
  }, [uploadPicture, uploadAntiSpam]);

  const handleDeletePicture = useCallback(async () => {
    if (deleteAntiSpam.canExecute) {
      await deleteAntiSpam.execute(async () => {
        try {
          await deletePicture.mutateAsync();
          // Close modal after successful deletion
          setShowCropDialog(false);
          setSelectedProfileImage(null);
          // Optionally wait a moment to ensure cache is updated
          setTimeout(() => {
            // This ensures the dialog content re-renders with fresh data
          }, 100);
        } catch (error) {
          console.error('Error deleting picture:', error);
        }
      });
    }
  }, [deletePicture, deleteAntiSpam]);

  if (isLoading) {
    return <ProfileLoadingSkeleton />;
  }

  if (!profile) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <p className="text-lg font-semibold text-title">Profile not found</p>
          <Button 
            onClick={() => router.back()} 
            disabled={isPending}
            className="mt-4 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isPending ? 'Going back...' : 'Go Back'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleBackClick = () => {
    // Simple router.back() without startTransition 
    router.back();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <ProfileHeader isPending={isPending} onBack={handleBackClick} />

      {/* Profile Card */}
      <ProfileCard profile={profile}>
        {/* Profile Picture and Recent Badges Section */}
        <div className="flex flex-col md:flex-row gap-12 mb-6 justify-center md:justify-start items-start md:items-start">
          {/* Profile Picture Display & Controls - Centered */}
          <div className="flex justify-center md:justify-start flex-shrink-0">
            <ProfilePicture
              profilePictureUrl={profile?.profilePictureUrl}
              userName={profile?.name || 'User'}
              userId={userId}
              isOwnProfile={isOwnProfile}
              isLoading={uploadPicture.isPending || isPending}
              isDeleting={deletePicture.isPending}
              onFileChange={handleFileChange}
              onDelete={handleDeletePicture}
              onOpenCropDialog={() => setShowCropDialog(true)}
            />
          </div>
          
          {/* Recent Badges Display - Smaller badges */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="text-center md:text-left">
              <p className="text-base font-semibold text-title">{profile.name}</p>
              {profile.employeeId && (
                <p className="text-xs text-muted-foreground">{profile.employeeId}</p>
              )}
            </div>
            <RecentBadges userId={userId} showLabel={true} maxBadges={2} />
          </div>
        </div>
      </ProfileCard>

      {/* Image Crop Upload Modal Dialog */}
      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crop Profile Picture</DialogTitle>
            <DialogDescription>
              Adjust your profile picture before uploading
            </DialogDescription>
          </DialogHeader>
          {showCropDialog && (
            <ImageCropUpload
              key={`crop-${profile?.id}-${profile?.profilePictureUrl || 'empty'}-${deletePicture.isPending}`}
              currentImageUrl={profile?.profilePictureUrl}
              userName={profile?.name || 'User'}
              userId={userId}
              onImageSelect={handleImageSelect}
              onImageClearLocal={handleDeletePicture}
              disabled={uploadPicture.isPending || !uploadAntiSpam.canExecute}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
