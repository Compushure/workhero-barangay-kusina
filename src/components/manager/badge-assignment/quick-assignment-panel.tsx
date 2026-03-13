'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HelpCircle, Coins, Search, ArrowUpDown } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import type { BadgeAssignmentUser, BadgeSummary } from '@/types/manager/badge-assignment';
import { normalizeSearchQuery, sanitizeSearchInput } from '@/lib/utils/search-normalization';

interface QuickAssignmentPanelProps {
  badges: BadgeSummary[];
  badgePage: number;
  totalBadgePages: number;
  onBadgePageChange: (page: number) => void;
  users: BadgeAssignmentUser[];
  onAwardBadge: (badgeId: string, user: BadgeAssignmentUser) => void;
}

type UserSortOption = 'name-asc' | 'name-desc' | 'employee-asc' | 'employee-desc';

const USER_SORT_OPTIONS: { value: UserSortOption; label: string }[] = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'employee-asc', label: 'Employee ID (↑)' },
  { value: 'employee-desc', label: 'Employee ID (↓)' },
];

export default function QuickAssignmentPanel({
  badges,
  badgePage,
  totalBadgePages,
  onBadgePageChange,
  users,
  onAwardBadge,
}: QuickAssignmentPanelProps) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeSummary | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [badgeSearchTerm, setBadgeSearchTerm] = useState('');
  const [userSortOption, setUserSortOption] = useState<UserSortOption>('name-asc');

  const debouncedUserSearch = useDebounce(userSearchTerm, 300);
  const debouncedBadgeSearch = useDebounce(badgeSearchTerm, 300);

  // Note: badges are already paginated from parent, just filter them locally
  const filteredBadges = useMemo(() => {
    const normalizedSearch = normalizeSearchQuery(debouncedBadgeSearch);
    return badges.filter(
      (badge) =>
        !normalizedSearch ||
        badge.name.toLowerCase().includes(normalizedSearch) ||
        badge.description?.toLowerCase().includes(normalizedSearch)
    );
  }, [badges, debouncedBadgeSearch]);

  // Filter users
  const filteredUsers = useMemo(() => {
    const normalizedSearch = normalizeSearchQuery(debouncedUserSearch);

    const filtered = users.filter(
      (user) =>
        !normalizedSearch ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
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
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleAssignToSelected = () => {
    if (!selectedBadge || selectedUsers.size === 0) return;

    const selectedBadgeId = selectedBadge.id;
    selectedUsers.forEach((userId) => {
      const user = users.find((u) => u.id === userId);
      if (user) {
        onAwardBadge(selectedBadgeId, user);
      }
    });

    setSelectedBadge(null);
    setSelectedUsers(new Set());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Badges List - Left Side */}
      <div className="lg:col-span-1 space-y-4">
        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">Select Badge</h2>
          <div className="relative flex">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 size-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search badges"
              value={badgeSearchTerm}
              onChange={(e) => setBadgeSearchTerm(sanitizeSearchInput(e.target.value))}
              className="text-meta control-h w-full pl-9 pr-3 rounded-md border border-zinc-200 bg-card shadow-sm/25 focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        {/* Badge List with Pagination */}
        <div className="space-y-3">
          <div className="border border-accent/25 rounded-lg overflow-hidden max-h-96 overflow-y-auto shadow-sm/25 [scrollbar-width:none] sm:[scrollbar-width:auto] [-ms-overflow-style:none] sm:[-ms-overflow-style:auto] [&::-webkit-scrollbar]:hidden sm:[&::-webkit-scrollbar]:block">
            {filteredBadges.length > 0 ? (
              <div className="divide-y divide-accent/25">
                {filteredBadges.map((badge) => (
                  <button
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    className={`w-full px-3 sm:px-4 py-3 text-left transition-colors ${
                      selectedBadge?.id === badge.id
                        ? 'bg-accent/15 border-l-4 border-accent'
                        : 'bg-card hover:bg-row-hover'
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="shrink-0 size-8 sm:size-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-accent/25">
                        {badge.img_link ? (
                          <img
                            src={badge.img_link}
                            alt={badge.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <HelpCircle size={16} className="sm:size-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs sm:text-sm text-foreground truncate">
                          {badge.name}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-secondary mt-0.5">
                          <Coins size={10} className="sm:size-3 shrink-0" />
                          <span>{badge.points}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-secondary text-sm">No badges found</div>
            )}
          </div>

          {/* Badge Pagination */}
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

      {/* Badge Details and User Assignment - Right Side */}
      <div className="lg:col-span-2 space-y-4">
        {selectedBadge ? (
          <>
            {/* Selected Badge Details */}
            <div className="bg-card border border-accent/25 rounded-lg p-4 sm:p-6 space-y-4 shadow-sm/25">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="size-16 sm:w-20 sm:h-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-accent/25 shrink-0">
                  {selectedBadge.img_link ? (
                    <img
                      src={selectedBadge.img_link}
                      alt={selectedBadge.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <HelpCircle size={32} className="sm:size-10 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground truncate">
                    {selectedBadge.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-secondary mt-1 line-clamp-2">
                    {selectedBadge.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                    <Coins size={14} className="sm:size-4 text-accent shrink-0" />
                    <span className="font-medium text-sm sm:text-base text-foreground">
                      {selectedBadge.points} points
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Selection */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                <h2 className="text-base sm:text-lg font-semibold text-foreground">
                  Assign To Users ({selectedUsers.size} selected)
                </h2>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="default"
                      size="default"
                      className="text-button control-h bg-card shadow-sm/25 hover:bg-gray-200 transition-all duration-200 ease-in-out cursor-pointer text-primary shadow-md w-full sm:w-44 py-1.5 justify-between border border-gray-200"
                    >
                      <span className="truncate">
                        {USER_SORT_OPTIONS.find((option) => option.value === userSortOption)
                          ?.label || 'Sort'}
                      </span>
                      <ArrowUpDown size={14} className="text-accent shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="manager-dropdown-content w-48">
                    {USER_SORT_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setUserSortOption(option.value)}
                        className={`manager-dropdown-item text-meta cursor-pointer transition-all duration-300 ease-in-out ${
                          userSortOption === option.value ? 'bg-accent/15 text-foreground' : ''
                        }`}
                      >
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="relative flex">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 size-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employee"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(sanitizeSearchInput(e.target.value))}
                  className="text-meta control-h w-full pl-9 pr-3 rounded-md border border-zinc-200 bg-card shadow-sm/25 focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            {/* Users Grid */}
            <div className="border border-accent/25 rounded-lg overflow-hidden shadow-sm/25">
              <div className="max-h-64 overflow-y-auto [scrollbar-width:none] sm:[scrollbar-width:auto] [-ms-overflow-style:none] sm:[-ms-overflow-style:auto] [&::-webkit-scrollbar]:hidden sm:[&::-webkit-scrollbar]:block">
                {filteredUsers.length > 0 ? (
                  <div className="divide-y divide-accent/25">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => toggleUserSelection(user.id)}
                        className={`w-full px-3 sm:px-4 py-3 flex items-center gap-2 sm:gap-3 transition-colors ${
                          selectedUsers.has(user.id) ? 'bg-accent/15' : 'bg-card hover:bg-row-hover'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => {}}
                          className="w-4 h-4 rounded border-accent/25 cursor-pointer shrink-0"
                        />
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-medium text-xs sm:text-sm text-foreground truncate">
                            {user.name}
                          </p>
                          <p className="text-[10px] sm:text-xs text-secondary truncate">
                            {user.employee_id}
                          </p>
                        </div>
                        <span className="text-[10px] sm:text-xs text-secondary shrink-0">
                          {user.badge_ids.length} badge{user.badge_ids.length !== 1 ? 's' : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-secondary text-sm">No users found</div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-accent/25">
              <Button
                onClick={() => setSelectedBadge(null)}
                variant="outline"
                className="text-button control-h flex-1 border-accent/25 text-primary bg-card hover:bg-accent/15 shadow-sm/25"
              >
                Clear Selection
              </Button>
              <Button
                onClick={handleAssignToSelected}
                disabled={selectedUsers.size === 0}
                className="text-button control-h flex-1 bg-primary-gradient hover:bg-primary-gradient hover:brightness-85 text-card disabled:opacity-50 shadow-sm/25"
              >
                Assign to {selectedUsers.size} User{selectedUsers.size !== 1 ? 's' : ''}
              </Button>
            </div>
          </>
        ) : (
          <div className="bg-card border border-dashed border-accent/25 rounded-lg p-12 text-center">
            <p className="text-secondary text-lg">Select a badge to assign to users</p>
          </div>
        )}
      </div>
    </div>
  );
}
