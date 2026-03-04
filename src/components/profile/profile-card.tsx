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
    <Card className="border-2 border-accent/25 shadow-lg transition-all duration-300 hover:shadow-xl p-0 bg-background">
      <CardHeader className="bg-linear-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent)] text-white rounded-t-lg px-6 py-4">
        <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pt-6 space-y-6">{children}</CardContent>
    </Card>
  );
}
