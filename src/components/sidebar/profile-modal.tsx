'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowRight, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProfileAvatar } from '@/components/shared/ProfileAvatar';
import { RecentBadges } from '@/components/profile/recent-badges';
import { UserWithExtras } from '@/types';
import { LogOutBtn } from '@/components/sidebar/logout-btn';

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithExtras | null;
}

export function ProfileModal({ open, onOpenChange, user }: ProfileModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!user) return null;

  const handleViewFullProfile = () => {
    startTransition(() => {
      onOpenChange(false);
      router.push(`/profile/${user.id}`);
    });
  };

  return (
    <Dialog open={open} onOpenChange={!isPending ? onOpenChange : undefined}>
      <DialogContent className="w-[min(90vw,360px)] sm:w-[min(88vw,420px)] md:w-[min(80vw,540px)] xl:w-[min(60vw,620px)] 2xl:w-[min(48vw,700px)] rounded-2xl p-3 sm:p-4 md:p-5 bg-background text-foreground [&>button]:hidden">
        {/* Custom Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          disabled={isPending}
          className="absolute right-3 top-3 md:right-4 md:top-4 rounded-lg opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-(--color-accent) focus:ring-offset-2 z-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <X className="h-4 w-4 md:h-5 md:w-5 text-(--color-accent)" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg md:text-xl font-bold text-title">
            My Profile
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Quick view of your profile information
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 md:gap-5 py-1 md:py-2">
          {/* Profile Picture */}
          <div className="flex justify-center">
            <ProfileAvatar
              userId={user.id}
              userName={user.name}
              profilePictureUrl={user.profilePictureUrl}
              size="lg"
              className="bg-(--color-background-soft) transition-transform duration-300 hover:scale-105 border-accent/15"
            />
          </div>

          {/* Recent Badges (3 badges) */}
          <div className="flex justify-center">
            <RecentBadges userId={user.id} showLabel={false} maxBadges={3} />
          </div>

          {/* Basic Information */}
          <div className="space-y-3 animate-in fade-in duration-300">
            <div className="space-y-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                <p className="text-sm sm:text-base font-semibold text-title">{user.name}</p>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Email Address</label>
                <p className="text-xs sm:text-sm font-semibold text-title break-all">{user.email}</p>
              </div>
              {user.employeeId && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">Employee ID</label>
                  <p className="text-sm sm:text-base font-semibold text-title">{user.employeeId}</p>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Role</label>
                <div>
                  <Badge variant="default" className="font-semibold capitalize">
                    {user.employeeType}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 md:pt-4 border-t border-border space-y-2.5">
            <Button
              onClick={handleViewFullProfile}
              disabled={isPending}
              className="w-full bg-(--color-accent) hover:bg-(--color-accent-secondary) disabled:bg-gray-400 disabled:opacity-70 disabled:cursor-not-allowed text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 group"
              size="default"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>See Full Profile Details</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </Button>
            
            {/* Logout Button */}
            <LogOutBtn />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
