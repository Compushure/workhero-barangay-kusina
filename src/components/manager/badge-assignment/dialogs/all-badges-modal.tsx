'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, Coins } from 'lucide-react';
import type { BadgeAssignmentUser, BadgeSummary } from '@/types/manager/badge-assignment';

// Types are provided by the badge assignment module.

interface AllBadgesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: BadgeAssignmentUser | null;
  badges: BadgeSummary[];
}

export default function AllBadgesModal({
  open,
  onOpenChange,
  user,
  badges,
}: AllBadgesModalProps) {
  if (!user) return null;

  const userBadges = user.badge_ids
    .map((id) => badges.find((b) => b.id === id))
    .filter(Boolean) as BadgeSummary[];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-none max-w-[95vw] sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="mb-6">
          <div className="space-y-2">
            <DialogTitle className="text-2xl text-foreground">All Badges - {user.name}</DialogTitle>
            <p className="text-sm text-gray-600">{user.employee_id}</p>
          </div>
        </DialogHeader>

        {/* Badges Grid */}
        {userBadges.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {userBadges.map((badge) => (
              <div
                key={badge.id}
                className="bg-white border border-[#e0cfcf] rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
              >
                {/* Badge Icon */}
                <div className="w-full aspect-square rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-[#e0cfcf]">
                  {badge.img_link ? (
                    <img
                      src={badge.img_link}
                      alt={badge.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <HelpCircle size={40} className="text-gray-400" />
                  )}
                </div>

                {/* Badge Info */}
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm text-red-950 line-clamp-2">{badge.name}</h4>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {badge.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-1 text-xs font-medium text-foreground">
                    <Coins size={14} />
                    {badge.points} points
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 border border-[#e0cfcf] text-center">
            <p className="text-gray-500">This user hasn't earned any badges yet</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-6 pt-6 border-t border-[#e0cfcf]">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="border-[#e0cfcf] text-foreground hover:bg-foreground/10"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
