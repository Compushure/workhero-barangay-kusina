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
    <Card className="border-2 border-accent/25 shadow-lg transition-all duration-300 hover:shadow-xl p-0 bg-background max-w-full">
      <CardHeader className="bg-linear-to-r from-(--color-accent-secondary) to-(--color-accent) text-white rounded-t-lg px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4">
        <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold">User Profile</CardTitle>
      </CardHeader>
      <CardContent className="px-2.5 pt-3 sm:px-3 sm:pt-4 md:px-6 md:pt-6 space-y-4 sm:space-y-5 md:space-y-6 max-w-full">{children}</CardContent>
    </Card>
  );
}
