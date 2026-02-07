'use client';

import { Label } from '@/components/ui/label';
import type { UserWithExtras } from '@/types';

interface ContactInformationProps {
  profile: UserWithExtras;
}

export function ContactInformation({ profile }: ContactInformationProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="contactNumber" className="text-sm font-medium text-muted-foreground">
          Phone Number
        </Label>
        <p className="text-base font-semibold text-[#730202] p-2 bg-white rounded-md">
          {profile.contactNumber || 'Not provided'}
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address" className="text-sm font-medium text-muted-foreground">
          Home Address
        </Label>
        <p className="text-base font-semibold text-[#730202] p-2 bg-white rounded-md">
          {profile.address || 'Not provided'}
        </p>
      </div>
    </div>
  );
}
