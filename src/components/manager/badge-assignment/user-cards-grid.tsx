'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

import type { BadgeAssignmentUser, BadgeSummary } from '@/types/manager/badge-assignment';

interface UserCardsGridProps {
  users: BadgeAssignmentUser[];
  badges: BadgeSummary[];
  onAwardClick: (user: BadgeAssignmentUser) => void;
  onViewAllBadges: (user: BadgeAssignmentUser) => void;
}

export default function UserCardsGrid({
  users,
  badges,
  onAwardClick,
  onViewAllBadges,
}: UserCardsGridProps) {
  const [brokenAvatars, setBrokenAvatars] = useState<Record<string, boolean>>({});
  const getBadgeById = (badgeId: string) => badges.find((b) => b.id === badgeId);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4">
      {users.map((user) => {
        const displayedBadges = user.badge_ids.slice(0, 3);
        const remainingBadgesCount = user.badge_ids.length - 3;
        const hasMoreBadges = remainingBadgesCount > 0;

        return (
          <div
            key={user.id}
            className="bg-card rounded-xl border-t border-gray-300 p-3 sm:p-3 hover:shadow-lg transition-shadow duration-300 shadow-sm/25"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              {/* Avatar and User Info */}
              <div className="shrink-0 flex items-center gap-2 sm:gap-3 min-w-0 sm:min-w-48">
                {/* Avatar */}
                {user.profilePictureUrl && !brokenAvatars[user.id] ? (
                  <img
                    src={user.profilePictureUrl}
                    alt={user.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-accent/25 shrink-0"
                    onError={() =>
                      setBrokenAvatars((prev) => ({
                        ...prev,
                        [user.id]: true,
                      }))
                    }
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-gradient flex items-center justify-center text-white font-bold text-2xs sm:text-xs border-2 border-accent/25 shrink-0">
                    {getInitials(user.name)}
                  </div>
                )}

                {/* User Details */}
                <div className="min-w-0 flex-1 sm:w-48">
                  <p className="font-semibold text-foreground text-sm truncate">{user.name}</p>
                  <p className="text-xs text-secondary truncate">{user.employee_id}</p>
                </div>
              </div>

              {/* Badges Section */}
              <div className="flex-1 flex items-center gap-2 px-0 sm:px-3 min-w-0">
                {user.badge_ids.length > 0 ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {displayedBadges.map((badgeId) => {
                      const badge = getBadgeById(badgeId);
                      return (
                        <div key={badgeId} className="group relative">
                          <div
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-accent/25 hover:border-accent transition-colors cursor-pointer shrink-0"
                            title={badge?.name}
                          >
                            {badge?.img_link ? (
                              <img
                                src={badge.img_link}
                                alt={badge.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <HelpCircle size={16} className="sm:size-5 text-gray-400" />
                            )}
                          </div>
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                            <div className="bg-card text-primary text-xs rounded px-1.5 py-0.5 whitespace-nowrap border-b-2 border-x border-accent-secondary/25">
                              {badge?.name}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* See More Button */}
                    {hasMoreBadges && (
                      <Button
                        onClick={() => onViewAllBadges(user)}
                        variant="outline"
                        size="sm"
                        className="h-8 sm:h-10 px-1.5 sm:px-2 border-accent/25 text-primary bg-card hover:bg-accent/15 text-2xs font-medium shadow-sm/25 shrink-0"
                      >
                        +{remainingBadgesCount}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-2xs text-secondary italic">No badges yet</div>
                )}
              </div>

              {/* Award Button */}
              <Button
                onClick={() => onAwardClick(user)}
                className="shrink-0 w-full sm:w-auto bg-primary-gradient hover:bg-primary-gradient hover:brightness-85 text-card text-xs shadow-sm/25 h-7 px-3"
              >
                Award Badge
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
