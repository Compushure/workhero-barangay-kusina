'use client';

import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, HelpCircle, Coins } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import type { BadgeAssignmentUser, BadgeSummary } from '@/types/manager/badge-assignment';

// Types are provided by the badge assignment module.

interface AwardBadgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: BadgeAssignmentUser | null;
  availableBadges: BadgeSummary[];
  onAwardBadge: (badgeId: string, user?: BadgeAssignmentUser) => void;
}

type SortOption = 'name-asc' | 'name-desc' | 'points-asc' | 'points-desc';

export default function AwardBadgeDialog({
  open,
  onOpenChange,
  user,
  availableBadges,
  onAwardBadge,
}: AwardBadgeDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filter and sort badges
  let filteredBadges = availableBadges.filter(
    (badge) =>
      badge.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      badge.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  // Sort badges
  filteredBadges = filteredBadges.sort((a, b) => {
    switch (sortOption) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'points-asc':
        return a.points - b.points;
      case 'points-desc':
        return b.points - a.points;
      default:
        return 0;
    }
  });

  const selectedBadge = availableBadges.find((b) => b.id === selectedBadgeId);
  const userHasBadge = selectedBadgeId && user?.badge_ids.includes(selectedBadgeId);

  const handleAward = () => {
    if (selectedBadgeId && user) {
      onAwardBadge(selectedBadgeId, user);
      setSelectedBadgeId(null);
      setSearchTerm('');
      setSortOption('name-asc');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedBadgeId(null);
      setSearchTerm('');
      setSortOption('name-asc');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-background border-none max-w-2xl rounded-2xl p-6 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#690003]">
            Award Badge to {user?.name}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Select a badge to award. Users can receive the same badge multiple times.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Search */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#5a2a2a]">Search Badges</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white border-[#e0cfcf] focus:border-[#690003] h-9 text-sm"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#5a2a2a]">Sort By</Label>
            <Select
              value={sortOption}
              onValueChange={(value) => setSortOption(value as SortOption)}
            >
              <SelectTrigger className="bg-white border-[#e0cfcf] focus:border-[#690003] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="points-asc">Points (Low to High)</SelectItem>
                <SelectItem value="points-desc">Points (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Badge List */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#5a2a2a]">Available Badges</Label>
            <div className="border border-[#e0cfcf] rounded-lg overflow-hidden bg-white">
              <div className="max-h-80 overflow-y-auto divide-y divide-[#e0cfcf]">
                {filteredBadges.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No badges found matching your search
                  </div>
                ) : (
                  filteredBadges.map((badge) => {
                    const userHas = user?.badge_ids.includes(badge.id) || false;
                    return (
                      <div
                        key={badge.id}
                        onClick={() => setSelectedBadgeId(badge.id)}
                        className={`p-4 cursor-pointer transition-colors ${
                          selectedBadgeId === badge.id
                            ? 'bg-[#690003]/10 border-l-4 border-[#690003]'
                            : 'hover:bg-gray-50'
                        } ${userHas ? 'bg-[#fdeac8]/30' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Badge Icon */}
                          <div className="shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-[#e0cfcf]">
                            {badge.img_link ? (
                              <img
                                src={badge.img_link}
                                alt={badge.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <HelpCircle size={24} className="text-gray-400" />
                            )}
                          </div>

                          {/* Badge Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-red-950 text-sm truncate">
                                {badge.name}
                              </h4>
                              <div className="flex items-center gap-1 text-xs font-medium text-[#690003]">
                                <Coins size={14} />
                                {badge.points}
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {badge.description || 'No description'}
                            </p>
                            {userHas && (
                              <span className="inline-block text-xs font-medium text-[#690003] bg-[#fdeac8] px-2 py-1 rounded mt-2">
                                User already has this badge
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Selected Badge Preview */}
          {selectedBadge && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <p className="text-xs font-medium text-blue-900">Selected Badge</p>
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-14 h-14 rounded-lg bg-white flex items-center justify-center overflow-hidden border border-blue-200">
                  {selectedBadge.img_link ? (
                    <img
                      src={selectedBadge.img_link}
                      alt={selectedBadge.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <HelpCircle size={28} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 text-sm">{selectedBadge.name}</h4>
                  <p className="text-xs text-blue-800 mt-1">{selectedBadge.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm font-medium text-blue-900">
                    <Coins size={16} />+{selectedBadge.points} points
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-[#e0cfcf]">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="border-[#e0cfcf] text-[#5a2a2a] hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAward}
            disabled={!selectedBadgeId}
            className="bg-[#690003] hover:brightness-100 text-zinc-50 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Award Badge
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
