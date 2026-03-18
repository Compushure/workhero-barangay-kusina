'use client';

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import type { UserWithExtras } from '@/types';

interface BasicInformationProps {
  profile: UserWithExtras;
}

export function BasicInformation({ profile }: BasicInformationProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 sm:gap-3 md:gap-4 w-full max-w-full pb-0">
      <div className="space-y-1.5 sm:space-y-2 min-w-0 max-w-full">
        <Label htmlFor="name" className="text-xs sm:text-sm font-medium text-muted-foreground">
          Full Name
        </Label>
        <p className="text-xs sm:text-sm md:text-base font-semibold text-title p-1.5 sm:p-2 bg-white rounded-md wrap-break-word">
          {profile.name}
        </p>
      </div>
      <div className="space-y-1.5 sm:space-y-2 min-w-0 max-w-full">
        <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-muted-foreground">
          Email Address
        </Label>
        <p className="text-xs sm:text-sm md:text-base font-semibold text-title p-1.5 sm:p-2 bg-white rounded-md break-all">
          {profile.email}
        </p>
      </div>
      {profile.employeeId && (
        <div className="space-y-1.5 sm:space-y-2 min-w-0 max-w-full">
          <Label htmlFor="employeeId" className="text-xs sm:text-sm font-medium text-muted-foreground">
            Employee ID
          </Label>
          <p className="text-xs sm:text-sm md:text-base font-semibold text-title p-1.5 sm:p-2 bg-white rounded-md break-all">
            {profile.employeeId}
          </p>
        </div>
      )}
      <div className="space-y-1.5 sm:space-y-2 min-w-0 max-w-full">
        <Label htmlFor="role" className="text-xs sm:text-sm font-medium text-muted-foreground">
          Role
        </Label>
        <div className="p-1.5 sm:p-2">
          <Badge variant="default" className="font-semibold capitalize text-xs sm:text-sm">
            {profile.employeeType}
          </Badge>
        </div>
      </div>
    </div>
  );
}
