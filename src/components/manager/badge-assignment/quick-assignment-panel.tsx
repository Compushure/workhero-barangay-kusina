'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HelpCircle, Coins, Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import type { BadgeAssignmentUser, BadgeSummary } from '@/types/manager/badge-assignment';

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
  const filteredBadges = useMemo(
    () =>
      badges.filter(
        (badge) =>
          badge.name.toLowerCase().includes(debouncedBadgeSearch.toLowerCase()) ||
          badge.description?.toLowerCase().includes(debouncedBadgeSearch.toLowerCase())
      ),
    [badges, debouncedBadgeSearch]
  );

  // Filter users
  const filteredUsers = useMemo(() => {
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(debouncedUserSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedUserSearch.toLowerCase()) ||
        (user.employee_id || '').toLowerCase().includes(debouncedUserSearch.toLowerCase())
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Badges List - Left Side */}
      <div className="lg:col-span-1 space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-[#690003]">Select Badge</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search badges..."
              value={badgeSearchTerm}
              onChange={(e) => setBadgeSearchTerm(e.target.value)}
              className="pl-10 bg-white border-[#e0cfcf] focus:border-[#690003] h-9 text-sm"
            />
          </div>
        </div>

        {/* Badge List with Pagination */}
        <div className="space-y-3">
          <div className="border border-[#e0cfcf] rounded-lg overflow-hidden max-h-96 overflow-y-auto">
            {filteredBadges.length > 0 ? (
              <div className="divide-y divide-[#e0cfcf]">
                {filteredBadges.map((badge) => (
                  <button
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    className={`w-full px-4 py-3 text-left transition-colors ${
                      selectedBadge?.id === badge.id
                        ? 'bg-[#fdeac8] border-l-4 border-[#690003]'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border border-[#e0cfcf]">
                        {badge.img_link ? (
                          <img
                            src={badge.img_link}
                            alt={badge.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <HelpCircle size={18} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-red-950 truncate">{badge.name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Coins size={12} className="text-[#690003]" />
                          <span className="text-xs text-[#690003] font-medium">{badge.points}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                No badges found
              </div>
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
                className="border-[#e0cfcf]"
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
                      ? 'bg-[#690003] text-white'
                      : 'border-[#e0cfcf]'
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
                className="border-[#e0cfcf]"
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
            <div className="bg-white border border-[#e0cfcf] rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-[#e0cfcf] shrink-0">
                  {selectedBadge.img_link ? (
                    <img
                      src={selectedBadge.img_link}
                      alt={selectedBadge.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <HelpCircle size={40} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-red-950">{selectedBadge.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedBadge.description || 'No description'}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Coins size={16} className="text-[#690003]" />
                    <span className="font-medium text-[#690003]">{selectedBadge.points} points</span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#690003]">
                  Assign To Users ({selectedUsers.size} selected)
                </h2>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 border-[#e0cfcf] text-[#690003] hover:bg-[#690003]/10"
                    >
                      {USER_SORT_OPTIONS.find((option) => option.value === userSortOption)?.label || 'Sort'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {USER_SORT_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setUserSortOption(option.value)}
                        className={userSortOption === option.value ? 'bg-[#fdeac8]' : ''}
                      >
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-[#e0cfcf] focus:border-[#690003] h-9 text-sm"
                />
              </div>
            </div>

            {/* Users Grid */}
            <div className="border border-[#e0cfcf] rounded-lg overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                {filteredUsers.length > 0 ? (
                  <div className="divide-y divide-[#e0cfcf]">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => toggleUserSelection(user.id)}
                        className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                          selectedUsers.has(user.id)
                            ? 'bg-[#fdeac8]'
                            : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => {}}
                          className="w-4 h-4 rounded border-[#e0cfcf] cursor-pointer"
                        />
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-medium text-sm text-red-950">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.employee_id}</p>
                        </div>
                        <span className="text-xs text-gray-500 shrink-0">
                          {user.badge_ids.length} badge{user.badge_ids.length !== 1 ? 's' : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No users found
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-[#e0cfcf]">
              <Button
                onClick={() => setSelectedBadge(null)}
                variant="outline"
                className="flex-1 border-[#e0cfcf] text-[#690003] hover:bg-[#690003]/10"
              >
                Clear Selection
              </Button>
              <Button
                onClick={handleAssignToSelected}
                disabled={selectedUsers.size === 0}
                className="flex-1 bg-[#690003] hover:brightness-90 text-white disabled:opacity-50"
              >
                Assign to {selectedUsers.size} User{selectedUsers.size !== 1 ? 's' : ''}
              </Button>
            </div>
          </>
        ) : (
          <div className="bg-white border border-dashed border-[#e0cfcf] rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg">Select a badge to assign to users</p>
          </div>
        )}
      </div>
    </div>
  );
}
