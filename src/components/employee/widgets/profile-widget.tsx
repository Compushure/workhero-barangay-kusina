'use client';

import { ProfileLevelSkeleton } from './widget-skeletons';
import { useGetSessionUser } from '@/hooks/tanstack/queries/userQueries';
import { useGetEmployeeXP } from '@/hooks/tanstack/queries/employeeQueries';
import { ProfileModal } from '@/components/sidebar/profile-modal';
import { useState } from 'react';
import { ProfileAvatar } from '@/components/shared/ProfileAvatar';

export default function ProfileLevelCard() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: user, isLoading: userLoading } = useGetSessionUser();
  const { isLoading: xpLoading } = useGetEmployeeXP();

  const initials = (() => {
    if (!user?.name) return 'U';
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  })();

  const name = user?.name ?? 'Employee';
  const email = user?.email ?? 'No email address';

  const isLoading = userLoading || xpLoading;

  if (isLoading) {
    return <ProfileLevelSkeleton />;
  }

  return (
    <>
      <div className="inline-flex w-auto max-w-full items-center wood-panel rounded-lg shadow-md p-2">
        {/* Avatar Circle with onClick */}
        <div
          onClick={() => setModalOpen(true)}
          className="w-12 h-12 rounded-full flex items-center justify-center wood-panel shrink-0 mr-3 overflow-hidden cursor-pointer hover:scale-105 transition-transform shadow-[2px_2px_2px_#000] shadow-[#47331F]/50"
        >
          {user ? (
            <ProfileAvatar
              userId={user.id}
              userName={user.name}
              profilePictureUrl={user.profilePictureUrl}
              size="sm"
              showBorder={false}
              className="h-full w-full"
            />
          ) : (
            <span className="text-base text-muted">{initials}</span>
          )}
        </div>

        {/* Profile name + email */}
        <div className="flex flex-col min-w-0">
          <span className="text-lg sm:text-xl font-semibold text-muted truncate tracking-wide">{name}</span>
          <span className="text-sm sm:text-base font-medium text-muted/75 truncate">{email}</span>
        </div>
      </div>

      {/* Modal */}
      <ProfileModal open={modalOpen} onOpenChange={setModalOpen} user={user || null} />
    </>
  );
}
