'use client';

import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

import type { BadgeAssignmentUser, BadgeSummary } from '@/types/manager/badge-assignment';

interface UserCardsGridProps {
  users: BadgeAssignmentUser[];
  badges: BadgeSummary[];
  onAwardClick: (user: BadgeAssignmentUser) => void;
  onViewAllBadges: (user: BadgeAssignmentUser) => void;
}

export default function UserCardsGrid({ users, badges, onAwardClick, onViewAllBadges }: UserCardsGridProps) {
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
            className="bg-white rounded-xl border border-[#e0cfcf] p-4 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center gap-4">
              {/* Avatar and User Info */}
              <div className="shrink-0 flex items-center gap-3 min-w-48">
                {/* Avatar */}
                {user.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#e0cfcf]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#690003] to-[#8b5a5a] flex items-center justify-center text-white font-bold text-sm border-2 border-[#e0cfcf]">
                    {getInitials(user.name)}
                  </div>
                )}

                {/* User Details */}
                <div className="min-w-0">
                  <p className="font-semibold text-red-950 text-sm truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.employee_id}</p>
                </div>
              </div>

              {/* Badges Section - Highlighted */}
              <div className="flex-1 flex items-center gap-3 px-4">
                {user.badge_ids.length > 0 ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    {displayedBadges.map((badgeId) => {
                      const badge = getBadgeById(badgeId);
                      return (
                        <div
                          key={badgeId}
                          className="group relative"
                        >
                          <div
                            className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-[#e0cfcf] hover:border-[#690003] transition-colors cursor-pointer"
                            title={badge?.name}
                          >
                            {badge?.img_link ? (
                              <img
                                src={badge.img_link}
                                alt={badge.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <HelpCircle size={24} className="text-gray-400" />
                            )}
                          </div>
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                            <div className="bg-[#690003] text-white text-xs rounded px-2 py-1 whitespace-nowrap">
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
                        className="h-12 px-3 border-[#e0cfcf] text-[#690003] hover:bg-[#690003]/10 text-xs font-medium"
                      >
                        +{remainingBadgesCount}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">No badges yet</div>
                )}
              </div>

              {/* Award Button */}
              <Button
                onClick={() => onAwardClick(user)}
                className="shrink-0 bg-[#690003] hover:brightness-90 text-white text-sm"
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
