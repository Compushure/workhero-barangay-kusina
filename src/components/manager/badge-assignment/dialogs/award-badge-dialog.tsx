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
import { normalizeSearchQuery, sanitizeSearchInput } from '@/lib/utils/search-normalization';

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
    (badge) => {
      const normalizedSearch = normalizeSearchQuery(debouncedSearchTerm);
      return (
        !normalizedSearch ||
        badge.name.toLowerCase().includes(normalizedSearch) ||
        badge.description?.toLowerCase().includes(normalizedSearch)
      );
    }
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
      <DialogContent className="bg-card border-none max-w-[95vw] sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl rounded-2xl p-6 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Award Badge to {user?.name}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Select a badge to award. Users can receive the same badge multiple times.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Search */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-primary">Search Badges</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search by badge name or description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(sanitizeSearchInput(e.target.value))}
                className="pl-9 bg-white h-9 text-sm"
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
              <SelectTrigger className="bg-white h-9 text-sm">
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
            <Label className="text-sm font-medium text-primary">Available Badges</Label>
            <div className="rounded-2xl border-2 border-accent-secondary/50 bg-card overflow-hidden">
              <div className="max-h-80 overflow-y-auto [scrollbar-width:none] sm:[scrollbar-width:auto] [-ms-overflow-style:none] sm:[-ms-overflow-style:auto] [&::-webkit-scrollbar]:hidden sm:[&::-webkit-scrollbar]:block">
                <table className="w-full table-fixed">
                  <thead className="sticky top-0 z-10 border-b border-accent-secondary/50 bg-primary-gradient text-card">
                    <tr className="text-xs font-semibold">
                      <th className="w-[10%] py-2"></th>
                      <th className="w-[58%] py-2 pl-3 text-left">BADGE</th>
                      <th className="w-[16%] py-2 text-center">POINTS</th>
                      <th className="w-[16%] py-2 text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBadges.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-sm text-secondary">
                          No badges found matching your search
                        </td>
                      </tr>
                    ) : (
                      filteredBadges.map((badge) => {
                        const userHas = user?.badge_ids.includes(badge.id) || false;
                        const isSelected = selectedBadgeId === badge.id;

                        return (
                          <tr
                            key={badge.id}
                            onClick={() => setSelectedBadgeId(badge.id)}
                            className={`border-b border-accent/25 text-primary transition-all duration-300 ease-in-out ${
                              isSelected
                                ? 'bg-accent-secondary/25'
                                : userHas
                                  ? 'bg-zinc-100/80'
                                  : 'bg-card hover:bg-row-hover cursor-pointer'
                            }`}
                          >
                            <td className="p-3 text-center align-middle">
                              <input
                                type="radio"
                                checked={isSelected}
                                onChange={() => setSelectedBadgeId(badge.id)}
                                className="rounded-full p-1.5 cursor-pointer appearance-none bg-card border border-accent checked:bg-accent checked:border-accent relative"
                                style={{
                                  backgroundImage: isSelected
                                    ? "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e\")"
                                    : 'none',
                                  backgroundRepeat: 'no-repeat',
                                  backgroundPosition: 'center',
                                  backgroundSize: '1rem',
                                }}
                              />
                            </td>
                            <td className="min-w-0 px-3 py-2 align-middle">
                              <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-accent/25 bg-gray-100">
                                  {badge.img_link ? (
                                    <img
                                      src={badge.img_link}
                                      alt={badge.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <HelpCircle size={22} className="text-gray-400" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="truncate text-sm font-semibold text-foreground">
                                    {badge.name}
                                  </h4>
                                  <p className="mt-0.5 line-clamp-2 text-xs text-primary/60">
                                    {badge.description || 'No description'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 text-center align-middle text-sm font-medium text-primary/75">
                              <div className="flex items-center justify-center gap-1">
                                <Coins size={14} className="shrink-0" />
                                {badge.points}
                              </div>
                            </td>
                            <td className="px-2 py-3 text-center align-middle">
                              {userHas ? (
                                <span className="inline-block rounded-full bg-background-soft px-2 py-1 text-[11px] font-medium text-foreground">
                                  Owned
                                </span>
                              ) : (
                                <span className="text-xs text-secondary">Available</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
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
            onClick={handleAward}
            disabled={!selectedBadgeId}
            className="bg-primary-gradient hover:bg-primary-gradient hover:brightness-85 text-card font-semibold cursor-pointer transition-all duration-500 ease-in-out shadow-sm/25 disabled:opacity-50 disabled:brightness-75 disabled:saturate-50 disabled:cursor-not-allowed"
          >
            Award Badge
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="border-[#e0cfcf] bg-card text-foreground hover:bg-[#fafafa] hover:text-foreground hover:brightness-90 px-6 cursor-pointer transition-all duration-500 ease-in-out shadow-sm/25"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
