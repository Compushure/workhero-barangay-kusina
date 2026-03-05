'use client';

import { memo } from 'react';
import { useGetUserBadges } from '@/hooks/tanstack/queries/employeeQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy } from 'lucide-react';

interface RecentBadgesProps {
  userId: string;
  showLabel?: boolean;
  maxBadges?: number;
}

function RecentBadgesComponent({ userId, showLabel = true, maxBadges = 2 }: RecentBadgesProps) {
  const { data: badges, isLoading } = useGetUserBadges(userId);

  if (isLoading) {
    return (
      <div className="flex gap-2">
        {[...Array(maxBadges)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-12 rounded-full" />
        ))}
      </div>
    );
  }

  if (!badges || badges.length === 0) {
    return null;
  }

  // Get the first N badges (they're already sorted by date_acquired in descending order from the view)
  const recentBadges = badges.slice(0, maxBadges);

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-600" />
          <p className="text-xs font-semibold text-muted-foreground">Recent Badges</p>
        </div>
      )}
      <div className="flex gap-2">
        {recentBadges.map((badge) => (
          <div
            key={badge.userbadge_id}
            className="relative group"
            title={`${badge.badge_name} - ${new Date(badge.date_acquired).toLocaleDateString()}`}
          >
            {badge.img_link ? (
              <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-accent/25 hover:border-accent transition-colors">
                <img
                  src={badge.img_link}
                  alt={badge.badge_name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center border-2 border-accent/25">
                <Trophy className="h-6 w-6 text-accent" />
              </div>
            )}

            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-black/80 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              <p className="font-semibold">{badge.badge_name}</p>
              <p className="text-gray-300 text-[10px]">
                {new Date(badge.date_acquired).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const RecentBadges = memo(RecentBadgesComponent);
RecentBadges.displayName = 'RecentBadges';
