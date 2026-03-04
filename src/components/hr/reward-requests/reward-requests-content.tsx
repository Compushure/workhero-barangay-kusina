'use client';

import { useState, useMemo, useCallback } from 'react';
import { HeaderSection } from '@/components/hr/dashboard/header';
import { RedemptionTable } from '@/components/hr/dashboard/redemption-table';
import { MarketSuspense } from '@/components/shared/market-suspense';
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8 pb-28">
        <MarketSuspense label="Loading redemption requests..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8 pb-28">
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <p className="text-red-600">Error loading redemption requests: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8 pb-28">
      <div className="mx-auto max-w-7xl space-y-8">
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
        <RedemptionTable data={filteredRequests} status={statusFilter} />
      </div>
    </div>
  );
}
