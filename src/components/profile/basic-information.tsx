'use client';

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import type { UserWithExtras } from '@/types';

interface BasicInformationProps {
  profile: UserWithExtras;
}

export function BasicInformation({ profile }: BasicInformationProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-muted-foreground">
          Full Name
        </Label>
        <p className="text-base font-semibold text-[#730202] p-2 bg-white rounded-md">
          {profile.name}
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
          Email Address
        </Label>
        <p className="text-base font-semibold text-[#730202] p-2 bg-white rounded-md break-all">
          {profile.email}
        </p>
      </div>
      {profile.employeeId && (
        <div className="space-y-2">
          <Label htmlFor="employeeId" className="text-sm font-medium text-muted-foreground">
            Employee ID
          </Label>
          <p className="text-base font-semibold text-[#730202] p-2 bg-white rounded-md">
            {profile.employeeId}
          </p>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="role" className="text-sm font-medium text-muted-foreground">
          Role
        </Label>
        <div className="p-2">
          <Badge variant="default" className="font-semibold capitalize text-sm">
            {profile.employeeType}
          </Badge>
        </div>
      </div>
    </div>
  );
}
