'use client';

import { useRouter } from 'next/navigation';
import { useCallback, Suspense, useState, useTransition } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { ImageCropUpload } from '@/components/admin/image-crop-upload';
import { useGetUserProfile } from '@/hooks/tanstack/queries/profileQueries';
import {
  useUploadOwnProfilePicture,
  useDeleteOwnProfilePicture,
} from '@/hooks/tanstack/mutations/profileMutations';
import { useAntiSpam } from '@/hooks/useAntiSpam';

const TAB_VALUES = ['personal', 'employment', 'badges'] as const;
type TabValue = (typeof TAB_VALUES)[number];
const DEFAULT_TAB: TabValue = 'personal';
const CHROME_TAB_STRIP_CLASS =
  '!flex !flex-row !flex-nowrap !items-end !justify-stretch !bg-transparent w-full !gap-[2px] !p-0 overflow-visible';
const CHROME_TAB_TRIGGER_CLASS =
  'chrome-tab z-0 flex-1 min-w-0 !h-[38px] !rounded-tl-[12px] !rounded-tr-[12px] !rounded-bl-none !rounded-br-none !bg-[#C1C5CC] !text-[#5F6368] !text-[0.72rem] sm:!text-[0.8rem] !font-medium hover:!bg-[#D0D4DA] hover:!text-[#3C4043] !overflow-hidden before:!hidden after:!hidden data-[state=active]:!bg-white data-[state=active]:!text-[#202124] data-[state=active]:!font-semibold data-[state=active]:!h-[42px] data-[state=active]:!z-[20] data-[state=active]:shadow-[0_-1px_0_0_rgba(255,255,255,1)] !border !border-gray-300 data-[state=active]:!border-b-0 !shadow-none !px-2 sm:!px-4 !py-0 whitespace-nowrap transition-colors pb-1.5 sm:pb-2.5 md:pb-3.5 lg:pb-4';
const SECTION_CARD_CLASS = 'space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4';
const SECTION_TITLE_CLASS = 'text-sm font-semibold text-[#E07C24]';
const TAB_PANEL_HEIGHT_CLASS = 'min-h-[22rem] sm:min-h-[24rem] lg:h-[28rem]';
const SKELETON_TAB_PANEL_HEIGHT_CLASS = 'min-h-[22rem] sm:min-h-[24rem] lg:h-[28rem]';

interface ProfilePageClientProps {
  userId: string;
}

function ProfileLoadingSkeleton() {
  return (
    <div className="w-full space-y-4 px-2 sm:px-0 md:mx-auto md:max-w-4xl lg:max-w-6xl">
      <Skeleton className="h-9 w-24 bg-white/80" />
      <div className="max-w-full overflow-hidden rounded-2xl border border-gray-300 bg-[#E5E7EB] p-0 shadow-md">
        <div className="rounded-none bg-[linear-gradient(90deg,#F29F4A_0%,#E07C24_100%)] px-4 py-3 sm:px-5 sm:py-3.5">
          <Skeleton className="h-8 w-44 bg-white/30" />
        </div>
        <div className="max-w-full space-y-3 px-3 py-3 sm:space-y-4 sm:px-4 sm:py-4 md:px-5 md:py-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-stretch xl:gap-5">
            <Skeleton className="h-80 w-full rounded-xl bg-white/80 lg:h-full" />
            <div className="min-w-0 lg:flex lg:h-full lg:flex-col">
              <Skeleton className="mb-2 h-11 w-full rounded-t-xl bg-white/80" />
              <Skeleton
                className={`w-full rounded-b-xl bg-white/80 ${SKELETON_TAB_PANEL_HEIGHT_CLASS}`}
              />
            </div>
          </div>
        </div>
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

  const { data: profile, isLoading } = useGetUserProfile(userId);
  const uploadPicture = useUploadOwnProfilePicture(userId);
  const deletePicture = useDeleteOwnProfilePicture(userId);

  // Anti-spam protection for mutations
  const uploadAntiSpam = useAntiSpam({ cooldown: 1500, maxAttempts: 3 });
  const deleteAntiSpam = useAntiSpam({ cooldown: 1500, maxAttempts: 3 });

  // So we can safely assume this is the user's own profile
  const isOwnProfile = true;

  const handleImageSelect = useCallback(
    (croppedImage: File) => {
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
    },
    [uploadPicture, uploadAntiSpam]
  );

  const handleFileChange = useCallback(
    async (file: File) => {
      if (uploadAntiSpam.canExecute) {
        await uploadAntiSpam.execute(async () => {
          try {
            await uploadPicture.mutateAsync(file);
          } catch (error) {
            console.error('Error uploading file:', error);
          }
        });
      }
    },
    [uploadPicture, uploadAntiSpam]
  );

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
    const nextValue = TAB_VALUES.includes(value as TabValue) ? (value as TabValue) : DEFAULT_TAB;
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
    <div className="w-full space-y-4 px-2 sm:px-0 md:mx-auto md:max-w-4xl lg:max-w-6xl">
      {/* Header */}
      <ProfileHeader isPending={isPending} onBack={handleBackClick} />

      {/* Profile Card */}
      <ProfileCard profile={profile}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-stretch xl:gap-5">
          <div className="h-full w-full rounded-xl border border-[#E8D8C1] bg-[linear-gradient(180deg,#F2B178_0%,#F8E4CA_52%,#FBF4E8_100%)] px-3 py-4 text-center shadow-sm sm:px-4 sm:py-5">
            <div className="flex flex-col items-center gap-2.5">
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
              <div className="w-full min-w-0 space-y-0.5">
                <p className="text-base font-semibold text-title wrap-break-word sm:text-lg md:text-xl">
                  {profile.name}
                </p>
                {profile.employeeId && (
                  <p className="text-xs font-medium text-muted-foreground break-all">
                    {profile.employeeId}
                  </p>
                )}
              </div>
              <RecentBadges userId={userId} showLabel={true} maxBadges={3} />
            </div>
          </div>
          <div className="min-w-0 lg:flex lg:flex-col">
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full gap-0 overflow-visible"
            >
              <div className="relative z-10 w-full px-0">
                <TabsList variant="line" className={CHROME_TAB_STRIP_CLASS}>
                  <TabsTrigger value="personal" className={CHROME_TAB_TRIGGER_CLASS}>
                    <span className="truncate sm:hidden">Personal</span>
                    <span className="hidden truncate sm:inline">Personal Information</span>
                  </TabsTrigger>
                  <TabsTrigger value="employment" className={CHROME_TAB_TRIGGER_CLASS}>
                    <span className="truncate sm:hidden">Employment</span>
                    <span className="hidden truncate sm:inline">Employment Details</span>
                  </TabsTrigger>
                  <TabsTrigger value="badges" className={CHROME_TAB_TRIGGER_CLASS}>
                    <span className="truncate sm:hidden">Badges</span>
                    <span className="hidden truncate sm:inline">All Badges</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </Tabs>

            <div
              className={`flex w-full max-w-full ${TAB_PANEL_HEIGHT_CLASS} flex-col overflow-hidden rounded-b-xl border border-t-0 bg-white p-2 sm:p-3 md:p-4 lg:flex-1`}
            >
              {activeTab === 'personal' && (
                <div className="h-full space-y-3 overflow-y-auto pr-2">
                  <section className={SECTION_CARD_CLASS}>
                    <h3 className={SECTION_TITLE_CLASS}>Basic Information</h3>
                    <BasicInformation profile={profile} />
                  </section>
                  <section className={SECTION_CARD_CLASS}>
                    <h3 className={SECTION_TITLE_CLASS}>Contact Information</h3>
                    <ContactInformation profile={profile} />
                  </section>
                </div>
              )}
              {activeTab === 'employment' && (
                <div className="h-full space-y-3 pr-2">
                  <section className={SECTION_CARD_CLASS}>
                    <h3 className={SECTION_TITLE_CLASS}>Employment Details</h3>
                    <EmploymentDetails profile={profile} />
                  </section>
                  <section className={`${SECTION_CARD_CLASS} flex-1`}>
                    <h3 className={SECTION_TITLE_CLASS}>Government IDs</h3>
                    <GovernmentIDs profile={profile} />
                  </section>
                </div>
              )}
              {activeTab === 'badges' && (
                <div className="h-full w-full max-w-full pr-2">
                  <BadgesCarousel userId={userId} />
                </div>
              )}
            </div>
          </div>
        </div>
      </ProfileCard>

      {/* Image Crop Upload Modal Dialog */}
      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="w-[min(92vw,720px)] max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crop Profile Picture</DialogTitle>
            <DialogDescription>Adjust your profile picture before uploading</DialogDescription>
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
