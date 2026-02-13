'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Coins, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UserCardsGrid from './user-cards-grid';
import QuickAssignmentPanel from './quick-assignment-panel';
import AwardBadgeDialog from './dialogs/award-badge-dialog';
import AllBadgesModal from './dialogs/all-badges-modal';
import { Pagination } from '../task-verification/pagination';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import { AwardSuspense } from '@/components/shared/award-suspense';
import type { BadgeAssignmentUser, BadgeSummary } from '@/types/manager/badge-assignment';
import {
  useGetAllBadges,
  useGetBadgeAssignmentUsers,
  useGetManualBadges,
} from '@/hooks/tanstack/queries/managerBadgeAssignmentQueries';
import { useAssignManualBadgeToUser } from '@/hooks/tanstack/mutations/managerBadgeAssignmentMutations';

type UserSortOption = 'name-asc' | 'name-desc' | 'employee-asc' | 'employee-desc';
type BadgeSortOption = 'name-asc' | 'name-desc' | 'points-desc' | 'points-asc';
type TabType = 'users' | 'quick-assign';

const USERS_PER_PAGE = 5;
const BADGES_PER_PAGE = 8;

const USER_SORT_OPTIONS: { value: UserSortOption; label: string }[] = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'employee-asc', label: 'Employee ID (↑)' },
  { value: 'employee-desc', label: 'Employee ID (↓)' },
];

const BADGE_SORT_OPTIONS: { value: BadgeSortOption; label: string }[] = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'points-desc', label: 'Points (High to Low)' },
  { value: 'points-asc', label: 'Points (Low to High)' },
];

export default function BadgeAssignmentPage() {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<UserSortOption>('name-asc');
  const [badgeSortOption, setBadgeSortOption] = useState<BadgeSortOption>('name-asc');
  const [userPage, setUserPage] = useState(1);
  const [badgePage, setBadgePage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<BadgeAssignmentUser | null>(null);
  const [allBadgesModalOpen, setAllBadgesModalOpen] = useState(false);
  const [selectedUserForAllBadges, setSelectedUserForAllBadges] = useState<BadgeAssignmentUser | null>(null);

  const manualBadgesQuery = useGetManualBadges();
  const allBadgesQuery = useGetAllBadges();
  const usersQuery = useGetBadgeAssignmentUsers();
  const assignBadgeMutation = useAssignManualBadgeToUser();

  const manualBadges = manualBadgesQuery.data ?? [];
  const allBadges = allBadgesQuery.data ?? [];
  const users = usersQuery.data ?? [];
  const isQuickAssignLoading = manualBadgesQuery.isLoading || usersQuery.isLoading;

  const debouncedSearchTerm = useDebounce(searchTerm, 900);

  // Set tab from hash on mount
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'quick-assign') {
        setActiveTab('quick-assign');
      } else {
        setActiveTab('users');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash when tab changes
  useEffect(() => {
    if (activeTab === 'quick-assign') {
      window.location.hash = '#quick-assign';
    } else {
      window.location.hash = '#users';
    }
  }, [activeTab]);

  // Reset page when search/sort changes
  useEffect(() => {
    setUserPage(1);
  }, [debouncedSearchTerm, sortOption]);

  const filteredUsers = useMemo(() => {
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      if (sortOption === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortOption === 'name-desc') {
        return b.name.localeCompare(a.name);
      }
      if (sortOption === 'employee-asc') {
        return (a.employee_id || '').localeCompare(b.employee_id || '');
      }
      return (b.employee_id || '').localeCompare(a.employee_id || '');
    });
  }, [users, debouncedSearchTerm, sortOption]);

  const sortedManualBadges = useMemo(() => {
    return [...manualBadges].sort((a: BadgeSummary, b: BadgeSummary) => {
      switch (badgeSortOption) {
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
  }, [manualBadges, badgeSortOption]);

  // Pagination for users
  const totalUserPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * USERS_PER_PAGE,
    userPage * USERS_PER_PAGE
  );

  // Pagination for badges in quick assignment
  const totalBadgePages = Math.ceil(sortedManualBadges.length / BADGES_PER_PAGE);
  const paginatedBadges = sortedManualBadges.slice(
    (badgePage - 1) * BADGES_PER_PAGE,
    badgePage * BADGES_PER_PAGE
  );

  const handleAwardClick = (user: BadgeAssignmentUser) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleAwardBadge = (badgeId: string, targetUser?: BadgeAssignmentUser) => {
    const userToUpdate = targetUser || selectedUser;
    if (!userToUpdate) return;

    if (userToUpdate.badge_ids.includes(badgeId)) {
      toast.error('User already has this badge');
      return;
    }

    assignBadgeMutation.mutate(
      { badgeId, userId: userToUpdate.id },
      {
        onSuccess: () => {
          setDialogOpen(false);
        },
      }
    );
  };

  const handleBadgeViewAll = (user: BadgeAssignmentUser) => {
    setSelectedUserForAllBadges(user);
    setAllBadgesModalOpen(true);
  };

  return (
    <main className="w-full min-h-screen bg-white p-10">
      <div className="mx-auto min-w-250 max-w-400 space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#690003]">Badge Assignment</h1>
          <p className="text-md text-gray-600">Manually award badges to employees.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm/25 w-fit">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex w-32 justify-center items-center gap-1.5 py-2 cursor-pointer rounded-lg text-sm font-medium transition-all duration-500 ease-in-out ${
              activeTab === 'users'
                ? 'bg-[#690003] text-white shadow-sm/15'
                : 'text-gray-500 hover:bg-gray-200'
            }`}
          >
            <Users size={16} />
            Users
          </button>
          <button
            onClick={() => setActiveTab('quick-assign')}
            className={`flex w-40 justify-center items-center gap-1.5 py-2 cursor-pointer rounded-lg text-sm font-medium transition-all duration-500 ease-in-out ${
              activeTab === 'quick-assign'
                ? 'bg-[#690003] text-white shadow-sm/15'
                : 'text-gray-500 hover:bg-gray-200'
            }`}
          >
            <Award size={16} />
            Quick Assign
          </button>
        </div>

        {/* Tab Content */}
        <section className="space-y-6">
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                {/* Badge Count Display */}
                <div className="flex gap-4 text-lg font-bold text-[#690003] pl-2">
                  <h5 className="flex items-center gap-2">
                    <Coins size={20} />
                    Employees{' '}
                    <span className="bg-gray-50 px-2.5 py-0.5 rounded-full text-sm ml-1 shadow-sm/15">
                      {filteredUsers.length ?? 0}
                    </span>
                  </h5>
                </div>

                {/* Search and Sort Controls */}
                <div className="flex gap-3 items-center">
                  <div className="relative flex">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                      <input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#690003] focus:border-[#690003]"
                    />
                  </div>

                  {/* Sort Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 border-gray-300 text-[#690003] hover:bg-[#690003]/10"
                      >
                        {USER_SORT_OPTIONS.find(opt => opt.value === sortOption)?.label || 'Sort'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {USER_SORT_OPTIONS.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => setSortOption(option.value)}
                          className={sortOption === option.value ? 'bg-[#fdeac8]' : ''}
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          )}

          {/* Quick Assignment Tab */}
          {activeTab === 'quick-assign' && (
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex gap-4 text-lg font-bold text-[#690003] pl-2">
                  <h5 className="flex items-center gap-2">
                    <Coins size={20} />
                    Manual Badges{' '}
                    <span className="bg-gray-50 px-2.5 py-0.5 rounded-full text-sm ml-1 shadow-sm/15">
                      {manualBadges.length}
                    </span>
                  </h5>
                </div>
                <p className="text-xs text-gray-600 ml-auto">Only manual badges (not conditional) appear here</p>
              </div>

              {/* Sort Dropdown for Badges */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-gray-300 text-[#690003] hover:bg-[#690003]/10"
                  >
                    {BADGE_SORT_OPTIONS.find(opt => opt.value === badgeSortOption)?.label || 'Sort'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {BADGE_SORT_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setBadgeSortOption(option.value)}
                      className={badgeSortOption === option.value ? 'bg-[#fdeac8]' : ''}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          {activeTab === 'users' ? (
            <>
              {usersQuery.isLoading ? (
                <div className="bg-[#f2e1c9] rounded-lg p-6 border border-[#f2e1c9]">
                  <AwardSuspense label="Loading users..." />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="bg-[#f2e1c9] rounded-lg p-12 border border-[#f2e1c9] text-center">
                  <p className="text-gray-500 text-lg">No users found matching your search</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <UserCardsGrid
                    users={paginatedUsers}
                    badges={allBadges}
                    onAwardClick={handleAwardClick}
                    onViewAllBadges={handleBadgeViewAll}
                  />

                  {/* Pagination for Users */}
                  {totalUserPages > 1 && (
                    <Pagination
                      totalPages={totalUserPages}
                      currentPage={userPage}
                      onPageChange={setUserPage}
                    />
                  )}
                </div>
              )}
            </>
          ) : (
            isQuickAssignLoading ? (
              <div className="bg-[#f2e1c9] rounded-lg p-6 border border-[#f2e1c9]">
                <AwardSuspense label="Loading badges..." />
              </div>
            ) : (
              <QuickAssignmentPanel
                badges={paginatedBadges}
                badgePage={badgePage}
                totalBadgePages={totalBadgePages}
                onBadgePageChange={setBadgePage}
                users={users}
                onAwardBadge={handleAwardBadge}
              />
            )
          )}
        </section>
      </div>

      {/* Award Badge Dialog */}
      <AwardBadgeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={selectedUser}
        availableBadges={manualBadges}
        onAwardBadge={handleAwardBadge}
      />

      {/* All Badges Modal */}
      <AllBadgesModal
        open={allBadgesModalOpen}
        onOpenChange={setAllBadgesModalOpen}
        user={selectedUserForAllBadges}
        badges={allBadges}
      />
    </main>
  );
}
