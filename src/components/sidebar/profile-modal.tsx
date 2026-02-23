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
      <DialogContent className="max-w-[95vw] sm:max-w-125 rounded-2xl p-4 sm:p-6 [&>button]:hidden">
        {/* Custom Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          disabled={isPending}
          className="absolute right-4 top-4 rounded-lg opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#730202] focus:ring-offset-2 z-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <X className="h-5 w-5 text-[#730202]" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold text-[#730202]">
            My Profile
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Quick view of your profile information
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-2">
          {/* Profile Picture */}
          <div className="flex justify-center">
            <ProfileAvatar
              userId={user.id}
              userName={user.name}
              profilePictureUrl={user.profilePictureUrl}
              size="lg"
              className="bg-[#f2e1c9] transition-transform duration-300 hover:scale-105 border-[#730202]/10"
            />
          </div>

          {/* Recent Badges (3 badges) */}
          <div className="flex justify-center">
            <RecentBadges userId={user.id} showLabel={false} maxBadges={3} />
          </div>

          {/* Basic Information */}
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                <p className="text-base font-semibold text-[#730202]">{user.name}</p>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Email Address</label>
                <p className="text-sm font-semibold text-[#730202] break-all">{user.email}</p>
              </div>
              {user.employeeId && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">Employee ID</label>
                  <p className="text-base font-semibold text-[#730202]">{user.employeeId}</p>
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

          {/* See Full Profile Button */}
          <div className="pt-4 border-t border-border">
            <Button
              onClick={handleViewFullProfile}
              disabled={isPending}
              className="w-full bg-[#730202] hover:bg-[#8b0003] disabled:bg-gray-400 disabled:opacity-70 disabled:cursor-not-allowed text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 group"
              size="lg"
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
