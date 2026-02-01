'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BasicInformation } from './basic-information';
import { EmploymentDetails } from './employment-details';
import { ContactInformation } from './contact-information';
import { GovernmentIDs } from './government-ids';
import type { UserWithExtras } from '@/types';
import { ReactNode } from 'react';

interface ProfileCardProps {
  profile: UserWithExtras;
  children?: ReactNode;
}

export function ProfileCard({ profile, children }: ProfileCardProps) {
  return (
    <Card className="border-2 border-[#730202]/20 shadow-lg transition-all duration-300 hover:shadow-xl p-0">
      <CardHeader className="bg-linear-to-r from-[#730202] to-[#8b0003] text-white rounded-t-lg px-6 py-4">
        <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pt-6">
        {children}
        <div className="space-y-6">
          <BasicInformation profile={profile} />
          <EmploymentDetails profile={profile} />
          <ContactInformation profile={profile} />
          <GovernmentIDs profile={profile} />
        </div>
      </CardContent>
    </Card>
  );
}
