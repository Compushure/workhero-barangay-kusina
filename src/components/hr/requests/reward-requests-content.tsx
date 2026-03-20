'use client';

import { useState, useMemo, useCallback, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HeaderSection } from './header';
import { HeaderSkeleton } from './header-skeleton';
import { RedemptionTable } from './redemption-table';
import { RedemptionTableSkeleton } from './redemption-table-skeleton';
import { useGetRedemptionRequests } from '@/hooks/tanstack/queries/redemptionQueries';
import { useDebounce } from '@/hooks/useDebounce';
import { normalizeSearchQuery, sanitizeSearchInput } from '@/lib/utils/search-normalization';

export function RewardRequestsContent() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, 250);

  // Fetch redemption requests from database with status filter
  const { data: requests = [], isLoading, error } = useGetRedemptionRequests(statusFilter);
  // Show skeleton only on first load to avoid flicker during background refetch.
  const isTableLoading = isLoading && requests.length === 0;

  useEffect(() => {
    if (error) {
      router.push(
        `/error?status=500&cause=${encodeURIComponent(error.message || 'Failed to load redemption requests')}&recommendation=${encodeURIComponent('Please refresh the page or try again later.')}`
      );
    }
  }, [error, router]);

  // Filter and sort the data with memoization
  const filteredRequests = useMemo(() => {
    const normalizedSearch = normalizeSearchQuery(debouncedSearchTerm);

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
          case 'employee-asc':
            return a.userName.localeCompare(b.userName);
          case 'employee-desc':
            return b.userName.localeCompare(a.userName);
          default:
            return 0;
        }
      });
  }, [requests, debouncedSearchTerm, sortBy]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(sanitizeSearchInput(value));
  }, []);

  const handleSort = useCallback((value: string) => {
    setSortBy(value);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value);
  }, []);

  if (error) return null;

  return (
    <main className="w-full min-h-screen bg-background px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-4 sm:gap-6 2xl:max-w-screen-2xl">
        <div className="flex flex-1 flex-col gap-4 sm:gap-6">
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
            {isTableLoading ? (
              <RedemptionTableSkeleton rows={8} />
            ) : (
              <RedemptionTable data={filteredRequests} status={statusFilter} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
