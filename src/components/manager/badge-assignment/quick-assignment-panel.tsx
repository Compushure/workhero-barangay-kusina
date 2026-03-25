'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowDown01,
  ArrowDownAZ,
  ArrowUp01,
  ArrowUpAZ,
  ArrowUpDown,
  Coins,
  HelpCircle,
  Search,
  type LucideIcon,
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import type { BadgeAssignmentUser, BadgeSummary } from '@/types/manager/badge-assignment';
import { normalizeSearchQuery, sanitizeSearchInput } from '@/lib/utils/search-normalization';

interface QuickAssignmentPanelProps {
  badges: BadgeSummary[];
  badgePage: number;
  totalBadgePages: number;
  onBadgePageChange: (page: number) => void;
  badgeSortOption: BadgeSortOption;
  onBadgeSortChange: (value: BadgeSortOption) => void;
  users: BadgeAssignmentUser[];
  onAwardBadgeToUsers: (badgeId: string, userIds: string[]) => void;
  isAssigning?: boolean;
}

type UserSortOption = 'name-asc' | 'name-desc' | 'employee-asc' | 'employee-desc';
type BadgeSortOption = 'name-asc' | 'name-desc' | 'points-desc' | 'points-asc';

const USER_NAME_SORT_OPTIONS: { value: UserSortOption; label: string; icon: LucideIcon }[] = [
  { value: 'name-asc', label: 'Name (A-Z)', icon: ArrowDownAZ },
  { value: 'name-desc', label: 'Name (Z-A)', icon: ArrowUpAZ },
];

const USER_ID_SORT_OPTIONS: { value: UserSortOption; label: string; icon: LucideIcon }[] = [
  { value: 'employee-asc', label: 'Employee ID (Low to High)', icon: ArrowDown01 },
  { value: 'employee-desc', label: 'Employee ID (High to Low)', icon: ArrowUp01 },
];

const USER_SORT_OPTIONS = [...USER_NAME_SORT_OPTIONS, ...USER_ID_SORT_OPTIONS];

const BADGE_NAME_SORT_OPTIONS: { value: BadgeSortOption; label: string; icon: LucideIcon }[] = [
  { value: 'name-asc', label: 'Name (A-Z)', icon: ArrowDownAZ },
  { value: 'name-desc', label: 'Name (Z-A)', icon: ArrowUpAZ },
];

const BADGE_POINTS_SORT_OPTIONS: { value: BadgeSortOption; label: string; icon: LucideIcon }[] = [
  { value: 'points-desc', label: 'Points (High to Low)', icon: Coins },
  { value: 'points-asc', label: 'Points (Low to High)', icon: Coins },
];

const BADGE_SORT_OPTIONS = [...BADGE_NAME_SORT_OPTIONS, ...BADGE_POINTS_SORT_OPTIONS];

export default function QuickAssignmentPanel({
  badges,
  badgePage,
  totalBadgePages,
  onBadgePageChange,
  badgeSortOption,
  onBadgeSortChange,
  users,
  onAwardBadgeToUsers,
  isAssigning = false,
}: QuickAssignmentPanelProps) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeSummary | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [badgeSearchTerm, setBadgeSearchTerm] = useState('');
  const [userSortOption, setUserSortOption] = useState<UserSortOption>('name-asc');

  const debouncedUserSearch = useDebounce(userSearchTerm, 300);
  const debouncedBadgeSearch = useDebounce(badgeSearchTerm, 300);

  const filteredBadges = useMemo(() => {
    const normalizedSearch = normalizeSearchQuery(debouncedBadgeSearch);
    return badges.filter(
      (badge) =>
        !normalizedSearch ||
        badge.name.toLowerCase().includes(normalizedSearch)
    );
  }, [badges, debouncedBadgeSearch]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = normalizeSearchQuery(debouncedUserSearch);

    const filtered = users.filter(
      (user) =>
        !normalizedSearch ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        (user.employee_id || '').toLowerCase().includes(normalizedSearch)
    );

    return [...filtered].sort((a, b) => {
      if (userSortOption === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (userSortOption === 'name-desc') {
        return b.name.localeCompare(a.name);
      }
      if (userSortOption === 'employee-asc') {
        return (a.employee_id || '').localeCompare(b.employee_id || '');
      }
      return (b.employee_id || '').localeCompare(a.employee_id || '');
    });
  }, [users, debouncedUserSearch, userSortOption]);

  const toggleUserSelection = (userId: string) => {
    if (selectedBadge) {
      const matchedUser = users.find((user) => user.id === userId);
      if (matchedUser?.badge_ids.includes(selectedBadge.id)) {
        return;
      }
    }

    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  useEffect(() => {
    if (!selectedBadge) {
      return;
    }

    setSelectedUsers((previous) => {
      const next = new Set(
        Array.from(previous).filter((userId) => {
          const matchedUser = users.find((user) => user.id === userId);
          return matchedUser ? !matchedUser.badge_ids.includes(selectedBadge.id) : false;
        })
      );

      return next;
    });
  }, [selectedBadge, users]);

  const handleAssignToSelected = () => {
    if (!selectedBadge || selectedUsers.size === 0) return;

    onAwardBadgeToUsers(selectedBadge.id, Array.from(selectedUsers));

    setSelectedBadge(null);
    setSelectedUsers(new Set());
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-1">
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-foreground sm:text-lg">Select Badge</h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search badges"
                value={badgeSearchTerm}
                onChange={(e) => setBadgeSearchTerm(sanitizeSearchInput(e.target.value))}
                className="text-meta control-h w-full rounded-md border border-zinc-200 bg-card pl-9 pr-3 shadow-sm/25 transition-colors focus:border-accent focus:outline-none"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-button control-h flex w-full items-center justify-between bg-card px-2 text-foreground shadow-sm/25 transition-all duration-400 ease-in-out cursor-pointer hover:bg-card hover:text-foreground hover:brightness-90 sm:w-44 sm:px-3"
                >
                  <span className="truncate">
                    {BADGE_SORT_OPTIONS.find((option) => option.value === badgeSortOption)?.label ||
                      'Sort'}
                  </span>
                  <ArrowUpDown className="shrink-0 text-accent" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="manager-dropdown-content w-[var(--radix-dropdown-menu-trigger-width)] min-w-[var(--radix-dropdown-menu-trigger-width)]"
              >
                <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">
                  Sort by Name
                </DropdownMenuLabel>
                {BADGE_NAME_SORT_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => onBadgeSortChange(option.value)}
                    className={`manager-dropdown-item text-meta cursor-pointer transition-all duration-300 ease-in-out ${
                      badgeSortOption === option.value ? 'bg-accent/15 text-foreground' : ''
                    }`}
                  >
                    <option.icon className="mr-2.5 size-3.5 shrink-0 text-accent" />
                    {option.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">
                  Sort by Points
                </DropdownMenuLabel>
                {BADGE_POINTS_SORT_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => onBadgeSortChange(option.value)}
                    className={`manager-dropdown-item text-meta cursor-pointer transition-all duration-300 ease-in-out ${
                      badgeSortOption === option.value ? 'bg-accent/15 text-foreground' : ''
                    }`}
                  >
                    <option.icon className="mr-2.5 size-3.5 shrink-0 text-accent" />
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-3">
          <div className="max-h-96 overflow-y-auto rounded-lg border border-accent/25 shadow-sm/25 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:[scrollbar-width:auto] sm:[-ms-overflow-style:auto] sm:[&::-webkit-scrollbar]:block">
            {filteredBadges.length > 0 ? (
              <div className="divide-y divide-accent/25">
                {filteredBadges.map((badge) => (
                  <button
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    className={`w-full px-3 py-3 text-left transition-colors sm:px-4 ${
                      selectedBadge?.id === badge.id
                        ? 'border-l-4 border-accent bg-accent/15'
                        : 'bg-card hover:bg-row-hover'
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-accent/25 bg-gray-100 sm:size-10">
                        {badge.img_link ? (
                          <img
                            src={badge.img_link}
                            alt={badge.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <HelpCircle size={16} className="text-gray-400 sm:size-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-semibold text-foreground sm:text-sm">
                          {badge.name}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-secondary sm:text-xs">
                          <Coins size={10} className="shrink-0 sm:size-3" />
                          <span>{badge.points}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-secondary">No badges found</div>
            )}
          </div>

          {totalBadgePages > 1 && (
            <div className="flex items-center justify-center gap-1">
              <Button
                onClick={() => onBadgePageChange(Math.max(1, badgePage - 1))}
                disabled={badgePage === 1}
                variant="outline"
                size="sm"
                className="border-accent/25 shadow-sm/25"
              >
                Prev
              </Button>
              {Array.from({ length: totalBadgePages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  onClick={() => onBadgePageChange(page)}
                  variant={badgePage === page ? 'default' : 'outline'}
                  size="sm"
                  className={
                    badgePage === page
                      ? 'bg-accent text-white shadow-sm/25'
                      : 'border-accent/25 shadow-sm/25'
                  }
                >
                  {page}
                </Button>
              ))}
              <Button
                onClick={() => onBadgePageChange(Math.min(totalBadgePages, badgePage + 1))}
                disabled={badgePage === totalBadgePages}
                variant="outline"
                size="sm"
                className="border-accent/25 shadow-sm/25"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 lg:col-span-2">
        {selectedBadge ? (
          <>
            <div className="space-y-3 rounded-lg border border-accent/25 bg-card px-3 py-2.5 shadow-sm/25 sm:px-4 sm:py-3">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-accent/25 bg-gray-100 py-1 sm:h-20 sm:w-20 sm:py-1.5">
                  {selectedBadge.img_link ? (
                    <img
                      src={selectedBadge.img_link}
                      alt={selectedBadge.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <HelpCircle size={32} className="text-gray-400 sm:size-10" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold text-foreground sm:text-lg">
                    {selectedBadge.name}
                  </h3>
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-secondary sm:text-xs">
                    {selectedBadge.description || 'No description'}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5 sm:mt-2 sm:gap-2">
                    <Coins size={13} className="shrink-0 text-accent sm:size-3.5" />
                    <span className="text-xs font-medium text-foreground sm:text-sm">
                      {selectedBadge.points} points
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <h2 className="text-base font-semibold text-foreground sm:text-lg">
                  Assign To Users ({selectedUsers.size} selected)
                </h2>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 transform text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search employee"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(sanitizeSearchInput(e.target.value))}
                    className="text-meta control-h w-full rounded-md border border-zinc-200 bg-card pl-9 pr-3 shadow-sm/25 transition-colors focus:border-accent focus:outline-none"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="default"
                      size="default"
                      className="text-button control-h w-full justify-between bg-card px-2 text-foreground shadow-sm/25 transition-all duration-400 ease-in-out cursor-pointer hover:bg-card hover:text-foreground hover:brightness-90 sm:w-44 sm:px-3"
                    >
                      <span className="truncate">
                        {USER_SORT_OPTIONS.find((option) => option.value === userSortOption)
                          ?.label || 'Sort'}
                      </span>
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
                    {USER_NAME_SORT_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setUserSortOption(option.value)}
                        className={`manager-dropdown-item text-meta cursor-pointer transition-all duration-300 ease-in-out ${
                          userSortOption === option.value ? 'bg-accent/15 text-foreground' : ''
                        }`}
                      >
                        <option.icon className="mr-2.5 size-3.5 shrink-0 text-accent" />
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">
                      Sort by Employee ID
                    </DropdownMenuLabel>
                    {USER_ID_SORT_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setUserSortOption(option.value)}
                        className={`manager-dropdown-item text-meta cursor-pointer transition-all duration-300 ease-in-out ${
                          userSortOption === option.value ? 'bg-accent/15 text-foreground' : ''
                        }`}
                      >
                        <option.icon className="mr-2.5 size-3.5 shrink-0 text-accent" />
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-accent/25 shadow-sm/25">
              <div className="max-h-64 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:[scrollbar-width:auto] sm:[-ms-overflow-style:auto] sm:[&::-webkit-scrollbar]:block">
                {filteredUsers.length > 0 ? (
                  <div className="divide-y divide-accent/25">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => toggleUserSelection(user.id)}
                        disabled={selectedBadge ? user.badge_ids.includes(selectedBadge.id) : false}
                        className={`flex w-full items-center gap-3 px-4 py-3 transition-colors ${
                          selectedBadge && user.badge_ids.includes(selectedBadge.id)
                            ? 'cursor-not-allowed bg-zinc-100/80 opacity-65'
                            : selectedUsers.has(user.id)
                              ? 'bg-accent/15'
                              : 'bg-card hover:bg-row-hover'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => {}}
                          disabled={selectedBadge ? user.badge_ids.includes(selectedBadge.id) : false}
                          className="h-4 w-4 cursor-pointer rounded border-accent/25 disabled:cursor-not-allowed"
                        />
                        <div className="min-w-0 flex-1 text-left">
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-secondary">{user.employee_id}</p>
                          {selectedBadge && user.badge_ids.includes(selectedBadge.id) ? (
                            <p className="text-[11px] text-muted-foreground">
                              Already has selected badge
                            </p>
                          ) : null}
                        </div>
                        <span className="shrink-0 text-[10px] text-secondary sm:text-xs">
                          {user.badge_ids.length} badge{user.badge_ids.length !== 1 ? 's' : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-secondary">No users found</div>
                )}
              </div>
            </div>

            <div className="flex gap-3 border-t border-accent/25 pt-4">
              <Button
                onClick={handleAssignToSelected}
                disabled={selectedUsers.size === 0 || isAssigning}
                className="text-button control-h flex-1 bg-primary-gradient text-card shadow-sm/25 cursor-pointer transition-all duration-500 ease-in-out hover:bg-primary-gradient hover:brightness-85 disabled:cursor-not-allowed disabled:opacity-50 disabled:brightness-50"
              >
                {isAssigning
                  ? 'Assigning...'
                  : `Assign to ${selectedUsers.size} User${selectedUsers.size !== 1 ? 's' : ''}`}
              </Button>
              <Button
                onClick={() => setSelectedBadge(null)}
                variant="outline"
                className="text-button control-h flex-1 bg-card text-foreground shadow-sm/25 cursor-pointer transition-all duration-500 ease-in-out hover:bg-[#fafafa] hover:text-foreground hover:brightness-90"
              >
                Clear Selection
              </Button>
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-accent/25 bg-card p-12 text-center">
            <p className="text-lg text-secondary">Select a badge to assign to users</p>
          </div>
        )}
      </div>
    </div>
  );
}
