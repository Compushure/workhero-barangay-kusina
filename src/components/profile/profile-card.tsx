'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserWithExtras } from '@/types';
import { ReactNode } from 'react';

interface ProfileCardProps {
  profile: UserWithExtras;
  children?: ReactNode;
}

export function ProfileCard({ profile, children }: ProfileCardProps) {
  return (
    <Card className="max-w-full overflow-hidden rounded-2xl border border-gray-300 bg-[#E5E7EB] p-0 shadow-md">
      <CardHeader className="rounded-none bg-[linear-gradient(90deg,#F29F4A_0%,#E07C24_100%)] px-4 py-3 sm:px-5 sm:py-3.5">
        <CardTitle className="text-lg font-bold text-white sm:text-xl">User Profile</CardTitle>
      </CardHeader>
      <CardContent className="max-w-full space-y-3 px-3 py-3 sm:space-y-4 sm:px-4 sm:py-4 md:px-5 md:py-5">
        {children}
      </CardContent>
    </Card>
  );
}
