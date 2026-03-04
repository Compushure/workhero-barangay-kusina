'use client';

import { useRouter } from 'next/navigation';
import { useCallback, Suspense, useEffect, useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileHeader } from './profile-header';
import { ProfilePicture } from './profile-picture';
import { ProfileCard } from './profile-card';
import { RecentBadges } from './recent-badges';
import { BadgesCarousel } from './badges-carousel';
import { BasicInformation } from './basic-information';
import { EmploymentDetails } from './employment-details';
import { ContactInformation } from './contact-information';
import { GovernmentIDs } from './government-ids';
import { GamifiedStats } from './gamified-stats';
import { ImageCropUpload } from '@/components/admin/image-crop-upload';
import { useGetUserProfile } from '@/hooks/tanstack/queries/profileQueries';
import { useUploadOwnProfilePicture, useDeleteOwnProfilePicture } from '@/hooks/tanstack/mutations/profileMutations';
import { useAntiSpam } from '@/hooks/useAntiSpam';

const TAB_VALUES = ['basic', 'contact', 'employment', 'ids', 'stats', 'badges'] as const;
type TabValue = (typeof TAB_VALUES)[number];
const DEFAULT_TAB: TabValue = 'basic';

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
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<TabValue>(DEFAULT_TAB);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  
  const { data: profile, isLoading } = useGetUserProfile(userId);
  const uploadPicture = useUploadOwnProfilePicture(userId);
  const deletePicture = useDeleteOwnProfilePicture(userId);
  
  // Anti-spam protection for mutations
  const uploadAntiSpam = useAntiSpam({ cooldown: 1500, maxAttempts: 3 });
  const deleteAntiSpam = useAntiSpam({ cooldown: 1500, maxAttempts: 3 });

  // Route is already protected by protectSessionRoute(userId) on the server
  // So we can safely assume this is the user's own profile
  const isOwnProfile = true;

  // Fetch user's role from Supabase claims
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const supabase = createClient();
        const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
        
        if (claimsError || !claimsData?.claims) {
          console.log('Failed to get user claims');
          setRoleLoading(false);
          return;
        }

        const role = claimsData.claims.app_metadata?.user_role;
        const normalizedRole = role?.trim().toLowerCase() || null;
        setUserRole(normalizedRole);
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setRoleLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  // Check if user can access stats tab (only regular/employee)
  const canAccessStats = userRole === 'regular' || userRole === 'employee';

  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace('#', '') as TabValue;
      
      // Check if the requested tab is 'stats' and user doesn't have access
      if (hash === 'stats' && !canAccessStats) {
        setActiveTab(DEFAULT_TAB);
        window.history.replaceState(null, '', `#${DEFAULT_TAB}`);
        return;
      }
      
      if (TAB_VALUES.includes(hash)) {
        setActiveTab(hash);
      } else {
        setActiveTab(DEFAULT_TAB);
      }
    };

    // Only apply hash once role has been loaded
    if (!roleLoading) {
      applyHash();
      window.addEventListener('hashchange', applyHash);
      return () => window.removeEventListener('hashchange', applyHash);
    }
  }, [roleLoading, canAccessStats]);

  const handleImageSelect = useCallback((croppedImage: File) => {
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

  const handleTabChange = (value: string) => {
    const nextValue = TAB_VALUES.includes(value as TabValue)
      ? (value as TabValue)
      : DEFAULT_TAB;
    setActiveTab(nextValue);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${nextValue}`);
    }
  };

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
    <div className="space-y-2 w-full px-2 sm:px-3 pb-6 md:max-w-3xl lg:max-w-4xl md:mx-auto">
      {/* Header */}
      <ProfileHeader isPending={isPending} onBack={handleBackClick} />

      {/* Profile Card */}
      <ProfileCard profile={profile}>
        <div className="flex flex-col items-center text-center gap-2.5 w-full bg-[linear-gradient(to_bottom,rgba(244,120,18,0.58)_0%,rgba(250,169,56,0.36)_38%,rgba(250,169,56,0)_100%)] rounded-xl px-4 py-5 sm:px-5 sm:py-6 shadow-inner">
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
          <div className="space-y-1">
            <p className="text-xl font-semibold text-title">{profile.name}</p>
            {profile.employeeId && (
              <p className="text-sm text-muted-foreground">{profile.employeeId}</p>
            )}
          </div>
          <RecentBadges userId={userId} showLabel={true} maxBadges={3} />
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full mt-5">
          <TabsList
            variant="line"
            className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 bg-transparent p-0 gap-2 h-auto"
          >
            <TabsTrigger value="basic" className="w-full h-auto! px-3 py-2 whitespace-normal text-center leading-tight data-[state=active]:bg-background-soft">
              Basic Information
            </TabsTrigger>
            <TabsTrigger value="contact" className="w-full h-auto! px-3 py-2 whitespace-normal text-center leading-tight data-[state=active]:bg-background-soft">
              Contact Information
            </TabsTrigger>
            <TabsTrigger value="employment" className="w-full h-auto! px-3 py-2 whitespace-normal text-center leading-tight data-[state=active]:bg-background-soft">
              Employment Details
            </TabsTrigger>
            <TabsTrigger value="ids" className="w-full h-auto! px-3 py-2 whitespace-normal text-center leading-tight data-[state=active]:bg-background-soft">
              Government IDs
            </TabsTrigger>
            {canAccessStats && (
              <TabsTrigger value="stats" className="w-full h-auto! px-3 py-2 whitespace-normal text-center leading-tight data-[state=active]:bg-background-soft">
                Gamified Stats
              </TabsTrigger>
            )}
            <TabsTrigger value="badges" className="w-full h-auto! px-3 py-2 whitespace-normal text-center leading-tight data-[state=active]:bg-background-soft">
              All Badges
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-4 space-y-4 pb-2 min-h-64 sm:min-h-72">
          {activeTab === 'basic' && <BasicInformation profile={profile} />}
          {activeTab === 'contact' && <ContactInformation profile={profile} />}
          {activeTab === 'employment' && <EmploymentDetails profile={profile} />}
          {activeTab === 'ids' && <GovernmentIDs profile={profile} />}
          {activeTab === 'stats' && canAccessStats && <GamifiedStats profile={profile} />}
          {activeTab === 'badges' && (
            <div className="space-y-2">
              <BadgesCarousel userId={userId} />
            </div>
          )}
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
