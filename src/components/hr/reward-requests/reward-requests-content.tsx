'use client';

import { useState, useMemo, useCallback, Suspense } from 'react';
import { HeaderSection } from '@/components/hr/dashboard/header';
import { HeaderSkeleton } from '@/components/hr/dashboard/header-skeleton';
import { RedemptionTable } from '@/components/hr/dashboard/redemption-table';
import { RedemptionTableSkeleton } from '@/components/hr/dashboard/redemption-table-skeleton';
import { useGetRedemptionRequests } from '@/hooks/tanstack/queries/redemptionQueries';
import { useDebounce } from '@/hooks/useDebounce';

export function RewardRequestsContent() {
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, 250);

  // Fetch redemption requests from database with status filter
  const { data: requests = [], isLoading, error } = useGetRedemptionRequests(statusFilter);

  // Filter and sort the data with memoization
  const filteredRequests = useMemo(() => {
    const normalizedSearch = debouncedSearchTerm.trim().toLowerCase();

    return requests
      .filter(
        (req) =>
          req.userName.toLowerCase().includes(normalizedSearch) ||
          req.rewardName.toLowerCase().includes(normalizedSearch)
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'date-desc':
            return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
          case 'date-asc':
            return new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
          case 'cost-desc':
            return b.pointsCost - a.pointsCost;
          case 'cost-asc':
            return a.pointsCost - b.pointsCost;
          case 'employee':
            return a.userName.localeCompare(b.userName);
          default:
            return 0;
        }
      });
  }, [requests, debouncedSearchTerm, sortBy]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleSort = useCallback((value: string) => {
    setSortBy(value);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value);
  }, []);

  if (error) {
    return (
      <div className="px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8 bg-zinc-100 min-h-screen flex flex-col">
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <p className="text-red-600">Error loading redemption requests: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8 bg-zinc-100 min-h-screen flex flex-col">
      <div className="mx-auto max-w-7xl 2xl:max-w-440 w-full flex-1 flex flex-col">
        {isLoading ? (
          <HeaderSkeleton />
        ) : (
          <div className="flex-1 flex flex-col gap-4 sm:gap-6">
            <Suspense fallback={<HeaderSkeleton />}>
              <HeaderSection
                title="Redemption Requests"
                description="Manage employee's request of redemption"
                searchTerm={searchTerm}
                onSearch={handleSearch}
                onSort={handleSort}
                sortBy={sortBy}
                statusFilter={statusFilter}
                onStatusChange={handleStatusChange}
              />
            </Suspense>
            <div className="flex-1 flex flex-col">
              <RedemptionTable data={filteredRequests} status={statusFilter} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
