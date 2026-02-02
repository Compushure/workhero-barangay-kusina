'use client';

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import type { UserWithExtras } from '@/types';

function formatDate(date: string | Date | undefined): string {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

interface EmploymentDetailsProps {
  profile: UserWithExtras;
}

export function EmploymentDetails({ profile }: EmploymentDetailsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {profile.employmentStatus && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Employment Status
          </Label>
          <div className="p-2">
            <Badge
              variant={profile.employmentStatus === 'regular' ? 'default' : 'secondary'}
              className="font-semibold capitalize"
            >
              {profile.employmentStatus}
            </Badge>
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-muted-foreground">
          Date Added
        </Label>
        <p className="text-base font-semibold text-[#730202] p-2 bg-white rounded-md">
          {formatDate(profile.date_added || profile.createdAt)}
        </p>
      </div>
    </div>
  );
}
