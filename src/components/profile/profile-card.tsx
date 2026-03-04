'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { BasicInformation } from './basic-information';
import { EmploymentDetails } from './employment-details';
import { ContactInformation } from './contact-information';
import { GovernmentIDs } from './government-ids';
import { BadgesCarousel } from './badges-carousel';
import type { UserWithExtras } from '@/types';
import { ReactNode } from 'react';

interface ProfileCardProps {
  profile: UserWithExtras;
  children?: ReactNode;
}

function ProfileCardComponent({ profile, children }: ProfileCardProps) {
  return (
    <Card className="border-2 border-accent/25 shadow-lg transition-all duration-300 hover:shadow-xl p-0 bg-background">
      <CardHeader className="bg-linear-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent)] text-white rounded-t-lg px-6 py-4">
        <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pt-6">
        {children}
        <Accordion type="multiple" defaultValue={["badges", "basic", "employment", "contact", "ids"]} className="space-y-4">
          {/* Badges Section */}
          <AccordionItem value="badges" className="border rounded-lg px-4">
            <AccordionTrigger className="text-sm font-semibold text-primary hover:no-underline">
              Badges
            </AccordionTrigger>
            <AccordionContent>
              <BadgesCarousel userId={profile.id} />
            </AccordionContent>
          </AccordionItem>

          {/* Basic Information Section */}
          <AccordionItem value="basic" className="border rounded-lg px-4">
            <AccordionTrigger className="text-sm font-semibold text-primary hover:no-underline">
              Basic Information
            </AccordionTrigger>
            <AccordionContent>
              <BasicInformation profile={profile} />
            </AccordionContent>
          </AccordionItem>

          {/* Employment Details Section */}
          <AccordionItem value="employment" className="border rounded-lg px-4">
            <AccordionTrigger className="text-sm font-semibold text-primary hover:no-underline">
              Employment Details
            </AccordionTrigger>
            <AccordionContent>
              <EmploymentDetails profile={profile} />
            </AccordionContent>
          </AccordionItem>

          {/* Contact Information Section */}
          <AccordionItem value="contact" className="border rounded-lg px-4">
            <AccordionTrigger className="text-sm font-semibold text-primary hover:no-underline">
              Contact Information
            </AccordionTrigger>
            <AccordionContent>
              <ContactInformation profile={profile} />
            </AccordionContent>
          </AccordionItem>

          {/* Government IDs Section */}
          <AccordionItem value="ids" className="border rounded-lg px-4">
            <AccordionTrigger className="text-sm font-semibold text-primary hover:no-underline">
              Government IDs
            </AccordionTrigger>
            <AccordionContent>
              <GovernmentIDs profile={profile} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

// Memoize to prevent unnecessary re-renders
export const ProfileCard = memo(ProfileCardComponent, (prev, next) => {
  return (
    prev.profile.id === next.profile.id &&
    prev.profile.name === next.profile.name &&
    prev.profile.email === next.profile.email
  );
});

ProfileCard.displayName = 'ProfileCard';
