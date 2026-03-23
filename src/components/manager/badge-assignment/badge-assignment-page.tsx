'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown01,
  ArrowDownAZ,
  ArrowUp01,
  ArrowUpAZ,
  ArrowUpDown,
  Award,
  Search,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UserCardsGrid from './user-cards-grid';
import QuickAssignmentPanel from './quick-assignment-panel';
import AwardBadgeDialog from './dialogs/award-badge-dialog';
import AllBadgesModal from './dialogs/all-badges-modal';
import { Pagination } from '@/components/shared/pagination';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import {
  BadgeAssignmentUsersSkeleton,
  BadgeAssignmentQuickSkeleton,
} from './badge-assignment-skeletons';
import { BadgeAssignmentHeaderSkeleton } from './badge-assignment-header-skeleton';
import type { BadgeAssignmentUser, BadgeSummary } from '@/types/manager/badge-assignment';
import {
  useGetAllBadges,
  useGetBadgeAssignmentUsers,
  useGetManualBadges,
} from '@/hooks/tanstack/queries/managerBadgeAssignmentQueries';
import {
  useAssignManualBadgeToUser,
  useAssignManualBadgesToUsersBulk,
} from '@/hooks/tanstack/mutations/managerBadgeAssignmentMutations';
import { normalizeSearchQuery, sanitizeSearchInput } from '@/lib/utils/search-normalization';
import { PageHeader } from '@/components/shared/page-header';
import { useManagerBadgeAssignmentStore } from '@/store/managerBadgeAssignmentStore';

type UserSortOption = 'name-asc' | 'name-desc' | 'employee-asc' | 'employee-desc';
type BadgeSortOption = 'name-asc' | 'name-desc' | 'points-desc' | 'points-asc';
type TabType = 'users' | 'quick-assign';

const USERS_PER_PAGE = 10;
const BADGES_PER_PAGE = 10;

const USER_NAME_SORT_OPTIONS: { value: UserSortOption; label: string; icon: LucideIcon }[] = [
  { value: 'name-asc', label: 'Name (A-Z)', icon: ArrowDownAZ },
  { value: 'name-desc', label: 'Name (Z-A)', icon: ArrowUpAZ },
];

const USER_ID_SORT_OPTIONS: { value: UserSortOption; label: string; icon: LucideIcon }[] = [
  { value: 'employee-asc', label: 'Employee ID (Low to High)', icon: ArrowDown01 },
  { value: 'employee-desc', label: 'Employee ID (High to Low)', icon: ArrowUp01 },
];

const USER_SORT_OPTIONS = [...USER_NAME_SORT_OPTIONS, ...USER_ID_SORT_OPTIONS];

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
  const [hasLoadedHeaderOnce, setHasLoadedHeaderOnce] = useState(false);

  const manualBadgesQuery = useGetManualBadges();
  const allBadgesQuery = useGetAllBadges();
  const usersQuery = useGetBadgeAssignmentUsers();
  const assignBadgeMutation = useAssignManualBadgeToUser();
  const assignBadgesBulkMutation = useAssignManualBadgesToUsersBulk();
  const { users, hydrateFromServer, isOptimistic } = useManagerBadgeAssignmentStore();

  const manualBadges = manualBadgesQuery.data ?? [];
  const allBadges = allBadgesQuery.data ?? [];
  const isQuickAssignLoading = manualBadgesQuery.isLoading || usersQuery.isLoading;
  const isHeaderLoading =
    usersQuery.isLoading || manualBadgesQuery.isLoading || allBadgesQuery.isLoading;

  useEffect(() => {
    if (!isHeaderLoading) {
      setHasLoadedHeaderOnce(true);
    }
  }, [isHeaderLoading]);

  const showHeaderSkeleton = !hasLoadedHeaderOnce && isHeaderLoading;

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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

  useEffect(() => {
    if (activeTab === 'quick-assign') {
      window.location.hash = '#quick-assign';
    } else {
      window.location.hash = '#users';
    }
  }, [activeTab]);

  useEffect(() => {
    setUserPage(1);
  }, [debouncedSearchTerm, sortOption]);

  useEffect(() => {
    if (usersQuery.data) {
      hydrateFromServer(usersQuery.data);
      return;
    }

    if (!usersQuery.isLoading) {
      hydrateFromServer([]);
    }
  }, [usersQuery.data, usersQuery.isLoading, hydrateFromServer, isOptimistic]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = normalizeSearchQuery(debouncedSearchTerm);

    const filtered = users.filter(
      (user) =>
        !normalizedSearch ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        (user.employee_id || '').toLowerCase().includes(normalizedSearch)
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

  const totalUserPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * USERS_PER_PAGE,
    userPage * USERS_PER_PAGE
  );

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

  const handleAwardBadgesBulk = (badgeId: string, userIds: string[]) => {
    const eligibleUserIds = userIds.filter((userId) => {
      const matchedUser = users.find((user) => user.id === userId);
      return matchedUser ? !matchedUser.badge_ids.includes(badgeId) : false;
    });

    if (eligibleUserIds.length === 0) {
      toast.error('All selected users already have this badge');
      return;
    }

    assignBadgesBulkMutation.mutate({ badgeId, userIds: eligibleUserIds });
  };

  return (
    <main className="w-full min-h-screen px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-screen-2xl space-y-5 sm:space-y-6 lg:space-y-8">
        {showHeaderSkeleton ? (
          <BadgeAssignmentHeaderSkeleton />
        ) : (
          <section className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-end lg:justify-between">
            <PageHeader title="Badge Assignment" subtitle="Manually award badges to employees." />

            <div className="flex h-fit w-full overflow-hidden rounded-md border border-accent/25 bg-card/75 shadow-sm/25 sm:w-fit">
              <button
                onClick={() => setActiveTab('users')}
                className={`text-button flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-l-md py-2.5 transition-all duration-500 ease-in-out sm:w-48 ${
                  activeTab === 'users'
                    ? 'bg-linear-to-b from-accent-secondary to-accent text-zinc-50 shadow-sm/25'
                    : 'text-secondary inset-shadow-2xs/25 hover:bg-accent-secondary/25'
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
                className={`text-button flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-r-md py-2.5 transition-all duration-500 ease-in-out sm:w-48 ${
                  activeTab === 'quick-assign'
                    ? 'bg-linear-to-b from-accent-secondary to-accent text-zinc-50 shadow-sm/25'
                    : 'text-secondary inset-shadow-2xs/25 hover:bg-accent-secondary/25'
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

        <section className="space-y-6">
          {showHeaderSkeleton ? (
            activeTab === 'users' ? (
              <BadgeAssignmentUsersSkeleton />
            ) : (
              <BadgeAssignmentQuickSkeleton />
            )
          ) : activeTab === 'users' ? (
            <div className="space-y-4">
              <div className="manager-sticky-controls flex min-w-0 flex-col gap-3 rounded-xl px-3 py-3 sm:px-4 sm:py-3.5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex shrink-0 self-start gap-4 whitespace-nowrap pl-2 text-h2 text-foreground xl:self-center">
                  <h5 className="flex items-center gap-2">
                    <Users size={20} className="text-accent" />
                    Employees{' '}
                    <span className="ml-1 rounded-md bg-accent/75 px-2.5 py-0.5 text-[13px] text-primary-foreground shadow-sm/25">
                      {filteredUsers.length ?? 0}
                    </span>
                  </h5>
                </div>

                <div className="flex w-full min-w-0 flex-col items-stretch gap-2 sm:gap-3 xl:w-auto xl:flex-row xl:items-center xl:justify-end">
                  <div className="relative min-w-0 flex-1 xl:max-w-md">
                    <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 transform text-gray-400" />
                    <input
                      placeholder="Search employees"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(sanitizeSearchInput(e.target.value))}
                      className="text-meta control-h w-full min-w-0 rounded-md border border-zinc-200 bg-card pr-3 pl-9 shadow-sm/25 transition-colors focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div className="flex min-w-0 flex-wrap gap-2 sm:flex-nowrap sm:gap-3 xl:justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="default"
                          size="default"
                          className="text-button control-h w-full justify-between bg-card px-2 text-foreground shadow-sm/25 transition-all duration-400 ease-in-out cursor-pointer hover:bg-card hover:text-foreground hover:brightness-90 sm:w-44 sm:px-3"
                        >
                          <span className="truncate">
                            {USER_SORT_OPTIONS.find((opt) => opt.value === sortOption)?.label ||
                              'Sort'}
                          </span>
                          <ArrowUpDown size={14} className="text-accent" />
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
                            onClick={() => setSortOption(option.value)}
                            className={`manager-dropdown-item text-meta cursor-pointer transition-all duration-300 ease-in-out ${
                              sortOption === option.value ? 'bg-accent/15 text-foreground' : ''
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
                            onClick={() => setSortOption(option.value)}
                            className={`manager-dropdown-item text-meta cursor-pointer transition-all duration-300 ease-in-out ${
                              sortOption === option.value ? 'bg-accent/15 text-foreground' : ''
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
              </div>

              {usersQuery.isLoading ? (
                <BadgeAssignmentUsersSkeleton />
              ) : filteredUsers.length === 0 ? (
                <div className="rounded-lg border border-accent/25 bg-background p-8 text-center">
                  <p className="text-base text-secondary">No users found matching your search</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <UserCardsGrid
                    users={paginatedUsers}
                    badges={allBadges}
                    onAwardClick={handleAwardClick}
                    onViewAllBadges={handleBadgeViewAll}
                  />

                  {totalUserPages > 1 && (
                    <Pagination
                      totalPages={totalUserPages}
                      currentPage={userPage}
                      onPageChange={setUserPage}
                    />
                  )}
                </div>
              )}
            </div>
        ) : (
            <div className="space-y-4">
              <div className="manager-sticky-controls flex min-w-0 flex-col gap-3 rounded-xl px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3.5">
                <div className="flex gap-3 pl-1 text-h2 text-foreground">
                  <h5 className="flex items-center gap-1.5">
                    <Award size={16} className="text-accent" />
                    Badges
                    <span className="ml-0.5 rounded-md bg-accent/75 px-2 py-0.5 text-[13px] text-primary-foreground shadow-sm/25">
                      {manualBadges.length}
                    </span>
                  </h5>
                </div>

                <p className="text-meta hidden text-secondary lg:inline">
                  Only manual badges (not conditional) appear here
                </p>
              </div>

              {isQuickAssignLoading ? (
                <BadgeAssignmentQuickSkeleton />
              ) : (
                <QuickAssignmentPanel
                  badges={paginatedBadges}
                  badgePage={badgePage}
                  totalBadgePages={totalBadgePages}
                  onBadgePageChange={setBadgePage}
                  badgeSortOption={badgeSortOption}
                  onBadgeSortChange={setBadgeSortOption}
                  users={users}
                  onAwardBadgeToUsers={handleAwardBadgesBulk}
                  isAssigning={assignBadgesBulkMutation.isPending}
                />
              )}
            </div>
          )}
        </section>
      </div>

      <AwardBadgeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={selectedUser}
        availableBadges={manualBadges}
        onAwardBadge={handleAwardBadge}
      />

      <AllBadgesModal
        open={allBadgesModalOpen}
        onOpenChange={setAllBadgesModalOpen}
        user={selectedUserForAllBadges}
        badges={allBadges}
      />
    </main>
  );
}
