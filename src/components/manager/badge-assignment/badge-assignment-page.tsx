'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Users, Award, ArrowUpDown } from 'lucide-react';
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
import {
  BadgeAssignmentUsersSkeleton,
  BadgeAssignmentQuickSkeleton,
} from './badge-assignment-skeletons';
import { BadgeAssignmentHeaderSkeleton } from './badge-assignment-header-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import type { BadgeAssignmentUser, BadgeSummary } from '@/types/manager/badge-assignment';
import {
  useGetAllBadges,
  useGetBadgeAssignmentUsers,
  useGetManualBadges,
} from '@/hooks/tanstack/queries/managerBadgeAssignmentQueries';
import { useAssignManualBadgeToUser } from '@/hooks/tanstack/mutations/managerBadgeAssignmentMutations';
import { normalizeSearchQuery, sanitizeSearchInput } from '@/lib/utils/search-normalization';
import { PageHeader } from '../task-verification/page-header';

type UserSortOption = 'name-asc' | 'name-desc' | 'employee-asc' | 'employee-desc';
type BadgeSortOption = 'name-asc' | 'name-desc' | 'points-desc' | 'points-asc';
type TabType = 'users' | 'quick-assign';

const USERS_PER_PAGE = 10;
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
  const [selectedUserForAllBadges, setSelectedUserForAllBadges] =
    useState<BadgeAssignmentUser | null>(null);

  const manualBadgesQuery = useGetManualBadges();
  const allBadgesQuery = useGetAllBadges();
  const usersQuery = useGetBadgeAssignmentUsers();
  const assignBadgeMutation = useAssignManualBadgeToUser();

  const manualBadges = manualBadgesQuery.data ?? [];
  const allBadges = allBadgesQuery.data ?? [];
  const users = usersQuery.data ?? [];
  const isQuickAssignLoading = manualBadgesQuery.isLoading || usersQuery.isLoading;
  const isHeaderLoading =
    usersQuery.isLoading || manualBadgesQuery.isLoading || allBadgesQuery.isLoading;

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
    const normalizedSearch = normalizeSearchQuery(debouncedSearchTerm);

    const filtered = users.filter(
      (user) =>
        !normalizedSearch ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch)
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
    <main className="w-full min-h-screen bg-zinc-100 px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-screen-2xl space-y-5 sm:space-y-6 lg:space-y-8">
        {isHeaderLoading ? (
          <BadgeAssignmentHeaderSkeleton />
        ) : (
          <section className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-3 sm:gap-4">
            {/* Title */}
            {/* <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Badge Assignment</h1>
            <p className="text-sm sm:text-base lg:text-lg text-secondary">Manually award badges to employees.</p>
          </div> */}
            <PageHeader title="Badge Assignment" subtitle="Manually award badges to employees." />

            {/* Tabs */}
            <div className="flex bg-card/75 rounded-2xl shadow-sm/25 w-full sm:w-fit h-fit border border-accent/25 overflow-hidden text-sm">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex flex-1 sm:w-36 justify-center items-center gap-1.5 py-2 cursor-pointer rounded-l-xl text-sm font-medium transition-all duration-500 ease-in-out ${
                  activeTab === 'users'
                    ? 'bg-linear-to-b from-accent-secondary to-accent text-zinc-50 shadow-sm/25'
                    : 'text-secondary hover:bg-accent-secondary/25 inset-shadow-2xs/25'
                }`}
              >
                <Users
                  size={16}
                  className={activeTab === 'users' ? 'text-zinc-50' : 'text-accent-secondary'}
                />
                <span className="hidden md:inline">Employee View</span>
              </button>
              <button
                onClick={() => setActiveTab('quick-assign')}
                className={`flex flex-1 sm:w-40 justify-center items-center gap-1.5 py-2.5 sm:py-3 cursor-pointer rounded-r-xl text-sm font-medium transition-all duration-500 ease-in-out ${
                  activeTab === 'quick-assign'
                    ? 'bg-linear-to-b from-accent-secondary to-accent text-zinc-50 shadow-sm/25'
                    : 'text-secondary hover:bg-accent-secondary/25 inset-shadow-2xs/25'
                }`}
              >
                <Award
                  size={16}
                  className={
                    activeTab === 'quick-assign' ? 'text-zinc-50' : 'text-accent-secondary'
                  }
                />
                <span className="hidden md:inline">Quick Assignment</span>
              </button>
            </div>
          </section>
        )}

        {/* Tab Content */}
        <section className="space-y-6">
          {isHeaderLoading ? (
            activeTab === 'users' ? (
              <BadgeAssignmentUsersSkeleton />
            ) : (
              <BadgeAssignmentQuickSkeleton />
            )
          ) : (
            <>
              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    {/* Badge Count Display */}
                    <div className="flex gap-4 text-lg font-bold text-foreground pl-2">
                      <h5 className="flex items-center gap-2">
                        <Users size={20} className="text-accent" />
                        Employees{' '}
                        <span className="bg-accent/75 text-primary-foreground px-2.5 py-0.5 rounded-full text-sm ml-1 shadow-sm/25">
                          {filteredUsers.length ?? 0}
                        </span>
                      </h5>
                    </div>

                    {/* Search and Sort Controls */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center w-full sm:w-auto">
                      <div className="relative flex">
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 size-3.5 text-gray-400" />
                        <input
                          placeholder="Search by employee name or email"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(sanitizeSearchInput(e.target.value))}
                          className="w-full pl-9 pr-3 py-2 rounded-full text-xs bg-card shadow-sm/25 focus:outline-none focus:border focus:border-accent transition-colors sm:w-50 md:w-75"
                        />
                      </div>

                      {/* Sort Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="default"
                            size="default"
                            className="bg-card shadow-sm/25 hover:bg-gray-200 transition-all duration-200 ease-in-out cursor-pointer text-primary shadow-md w-full sm:w-40 py-1.5 justify-between border border-gray-200 h-8 text-xs"
                          >
                            <span className="truncate">{USER_SORT_OPTIONS.find((opt) => opt.value === sortOption)?.label ||
                              'Sort'}</span>
                            <ArrowUpDown size={14} className="text-accent" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background">
                          {USER_SORT_OPTIONS.map((option) => (
                            <DropdownMenuItem
                              key={option.value}
                              onClick={() => setSortOption(option.value)}
                              className={`cursor-pointer transition-all duration-300 ease-in-out text-xs ${
                                sortOption === option.value ? 'bg-accent/15' : ''
                              }`}
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
                    <div className="flex gap-3 text-base font-bold text-foreground pl-1">
                      <h5 className="flex items-center gap-1.5">
                        <Award size={16} className="text-accent" />
                        Badges
                        <span className="bg-accent/75 text-primary-foreground px-2 py-0.5 rounded-full text-xs ml-0.5 shadow-sm/25">
                          {manualBadges.length}
                        </span>
                      </h5>
                    </div>
                    <p className="text-2xs text-secondary ml-auto hidden sm:inline">
                      Only manual badges (not conditional) appear here
                    </p>
                  </div>

                  {/* Sort Dropdown for Badges */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex justify-between items-center py-4 w-40 border-accent/25 text-primary bg-card hover:bg-card hover:brightness-90 shadow-sm/25"
                      >
                        {BADGE_SORT_OPTIONS.find((opt) => opt.value === badgeSortOption)?.label ||
                          'Sort'}
                        <ArrowUpDown className="text-accent" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="bg-background">
                      {BADGE_SORT_OPTIONS.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => setBadgeSortOption(option.value)}
                          className={badgeSortOption === option.value ? 'bg-accent/15' : ''}
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
                    <BadgeAssignmentUsersSkeleton />
                  ) : filteredUsers.length === 0 ? (
                    <div className="bg-background rounded-lg p-8 border border-accent/25 text-center">
                      <p className="text-secondary text-base">
                        No users found matching your search
                      </p>
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
              ) : isQuickAssignLoading ? (
                <BadgeAssignmentQuickSkeleton />
              ) : (
                <QuickAssignmentPanel
                  badges={paginatedBadges}
                  badgePage={badgePage}
                  totalBadgePages={totalBadgePages}
                  onBadgePageChange={setBadgePage}
                  users={users}
                  onAwardBadge={handleAwardBadge}
                />
              )}
            </>
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
