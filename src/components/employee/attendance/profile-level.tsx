'use client';

import { useState, useEffect, useMemo } from 'react';
import { handleFetchEmployeeXP } from '@/action-handlers/employees';
import { useGetSessionUser } from '@/hooks/tanstack/queries/userQueries';
import type { EmployeeXP } from '@/types';

export default function ProfileLevelCard() {
  const [xpData, setXpData] = useState<EmployeeXP | null>(null);
  const { data: user } = useGetSessionUser();
  const [hasImage, setHasImage] = useState(true);

  useEffect(() => {
    async function fetchXP() {
      const data = await handleFetchEmployeeXP();
      setXpData(data);
    }
    fetchXP();
  }, []);

  const imageUrlWithCacheBust = useMemo(() => {
    if (!user?.profilePictureUrl) return undefined;
    const separator = user.profilePictureUrl.includes('?') ? '&' : '?';
    const version = user?.id ?? 'v1';
    return `${user.profilePictureUrl}${separator}v=${encodeURIComponent(version)}`;
  }, [user?.profilePictureUrl, user?.id]);

  const initials = (() => {
    if (!user?.name) return 'U';
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  })();

  const level = xpData?.level ?? 0;
  const name = user?.name ?? 'Employee';

  return (
    <div className="inline-flex items-center bg-[#765332] border-3 border-[#47331F] rounded-lg shadow-md p-2">
      {/* Avatar Circle */}
      <div className="w-12 h-12 rounded-full bg-[#E89C30] flex items-center justify-center border-2 border-[#47331F] shrink-0 mr-3 overflow-hidden">
        {imageUrlWithCacheBust && hasImage ? (
          <img
            src={imageUrlWithCacheBust}
            alt={user?.name || 'User profile'}
            className="w-full h-full rounded-full object-cover"
            onError={() => setHasImage(false)}
          />
        ) : (
          <span className="text-base font-bold text-[#690003]">{initials}</span>
        )}
      </div>

      {/* Profile name + level */}
      <div className="flex flex-col">
        <span className="text-xl font-semibold text-[#F5E8D6]">{name}</span>
        <span className="text-lg font-medium text-[#9E9985]">Lv. {level}</span>
      </div>
    </div>
  );
}
