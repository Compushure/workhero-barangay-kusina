'use client';

import { Label } from '@/components/ui/label';
import type { UserWithExtras } from '@/types';

interface ContactInformationProps {
  profile: UserWithExtras;
}

export function ContactInformation({ profile }: ContactInformationProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 w-full max-w-full">
      <div className="space-y-1.5 sm:space-y-2 min-w-0 max-w-full">
        <Label htmlFor="contactNumber" className="text-xs sm:text-sm font-medium text-muted-foreground">
          Phone Number
        </Label>
        <p className="text-xs sm:text-sm md:text-base font-semibold text-title p-1.5 sm:p-2 bg-white rounded-md break-all">
          {profile.contactNumber || 'Not provided'}
        </p>
      </div>
      <div className="space-y-1.5 sm:space-y-2 min-w-0 max-w-full">
        <Label htmlFor="address" className="text-xs sm:text-sm font-medium text-muted-foreground">
          Home Address
        </Label>
        <p
          className="text-xs sm:text-sm md:text-base font-semibold text-title p-1.5 sm:p-2 bg-white rounded-md wrap-break-word line-clamp-2"
          title={profile.address || 'Not provided'}
        >
          {profile.address || 'Not provided'}
        </p>
      </div>
    </div>
  );
}
