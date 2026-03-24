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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, HelpCircle, Coins, ArrowDownAZ, ArrowUpAZ, ArrowUpDown, type LucideIcon } from 'lucide-react';
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

const SORT_OPTIONS: { value: SortOption; label: string; icon: LucideIcon }[] = [
  { value: 'name-asc', label: 'Name (A-Z)', icon: ArrowDownAZ },
  { value: 'name-desc', label: 'Name (Z-A)', icon: ArrowUpAZ },
  { value: 'points-asc', label: 'Points (Low to High)', icon: Coins },
  { value: 'points-desc', label: 'Points (High to Low)', icon: Coins },
];

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
  const selectedSortOption = SORT_OPTIONS.find((option) => option.value === sortOption) ?? SORT_OPTIONS[0];

  // Filter and sort badges
  let filteredBadges = availableBadges.filter(
    (badge) => {
      const normalizedSearch = normalizeSearchQuery(debouncedSearchTerm);
      return (
        !normalizedSearch ||
        badge.name.toLowerCase().includes(normalizedSearch)
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            {/* Search */}
            <div className="min-w-0 flex-1 space-y-2">
              <Label className="text-sm font-medium text-primary">Search Badges</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search by badge name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(sanitizeSearchInput(e.target.value))}
                  className="control-h bg-white pl-9 text-sm"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="space-y-2 sm:w-56 sm:flex-none">
              <Label className="text-sm font-medium text-[#5a2a2a]">Sort By</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="default"
                    size="default"
                    className="text-button control-h w-full justify-between bg-card px-2 text-foreground shadow-sm/25 transition-all duration-400 ease-in-out cursor-pointer hover:bg-card hover:text-foreground hover:brightness-90 sm:px-3"
                  >
                    <span className="truncate">{selectedSortOption.label}</span>
                    <ArrowUpDown size={14} className="shrink-0 text-accent" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="manager-dropdown-content w-[var(--radix-dropdown-menu-trigger-width)] min-w-[var(--radix-dropdown-menu-trigger-width)]"
                >
                  <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">
                    Sort by Name
                  </DropdownMenuLabel>
                  {SORT_OPTIONS.filter((option) => option.value.startsWith('name')).map((option) => {
                    const OptionIcon = option.icon;
                    return (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setSortOption(option.value)}
                        className={`manager-dropdown-item text-meta cursor-pointer transition-all duration-300 ease-in-out ${
                          sortOption === option.value ? 'bg-accent/15 text-foreground' : ''
                        }`}
                      >
                        <OptionIcon className="mr-2.5 size-3.5 shrink-0 text-accent" />
                        {option.label}
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">
                    Sort by Points
                  </DropdownMenuLabel>
                  {SORT_OPTIONS.filter((option) => option.value.startsWith('points')).map((option) => {
                    const OptionIcon = option.icon;
                    return (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setSortOption(option.value)}
                        className={`manager-dropdown-item text-meta cursor-pointer transition-all duration-300 ease-in-out ${
                          sortOption === option.value ? 'bg-accent/15 text-foreground' : ''
                        }`}
                      >
                        <OptionIcon className="mr-2.5 size-3.5 shrink-0 text-accent" />
                        {option.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
        <div className="mt-4 flex justify-end gap-3">
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
