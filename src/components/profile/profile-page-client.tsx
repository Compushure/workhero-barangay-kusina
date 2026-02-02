'use client';

import { useRouter } from 'next/navigation';
import { useCallback, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfileHeader } from './profile-header';
import { ProfilePicture } from './profile-picture';
import { ProfileCard } from './profile-card';
import { useGetUserProfile } from '@/hooks/tanstack/queries/profileQueries';
import { useGetSessionUser } from '@/hooks/tanstack/queries/userQueries';
import { useUploadOwnProfilePicture } from '@/hooks/tanstack/mutations/profileMutations';

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
  const { data: profile, isLoading } = useGetUserProfile(userId);
  const { data: currentUser } = useGetSessionUser();
  const uploadPicture = useUploadOwnProfilePicture(userId);

  // Check if the current user is viewing their own profile
  const isOwnProfile = currentUser?.id === userId;

  const handleFileChange = useCallback(async (file: File) => {
    try {
      await uploadPicture.mutateAsync(file);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }, [uploadPicture]);

  if (isLoading) {
    return <ProfileLoadingSkeleton />;
  }

  if (!profile) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <p className="text-lg font-semibold text-[#730202]">Profile not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ProfileHeader onBack={() => router.back()} />

      {/* Profile Card */}
      <ProfileCard profile={profile}>
        {/* Profile Picture */}
        <ProfilePicture
          profilePictureUrl={profile.profilePictureUrl}
          userName={profile.name}
          isOwnProfile={isOwnProfile}
          isLoading={uploadPicture.isPending}
          onFileChange={handleFileChange}
        />
      </ProfileCard>
    </div>
  );
}
