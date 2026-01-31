'use client';

import { useState, useMemo, useCallback } from 'react';
import { HeaderSection } from '@/components/hr/dashboard/header';
import { RedemptionTable } from '@/components/hr/dashboard/redemption-table';
import { useGetRedemptionRequests } from '@/hooks/tanstack/queries/redemptionQueries';

export function RewardRequestsContent() {
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch redemption requests from database with status filter
  const { data: requests = [], isLoading, error } = useGetRedemptionRequests(statusFilter);

  // Filter and sort the data with memoization
  const filteredRequests = useMemo(() => {
    return requests
      .filter(
        (req) =>
          req.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.rewardName.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [requests, searchTerm, sortBy]);

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
      <div className="min-h-screen bg-[#fff8f5] p-8">
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#f97316] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#5a2a2a]">Loading redemption requests...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fff8f5] p-8">
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <p className="text-red-600">Error loading redemption requests: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8f5] p-8">
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
        {filteredRequests.length === 0 ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-md">
            <p className="text-[#5a2a2a]">
              {searchTerm
                ? 'No redemption requests match your search.'
                : `No ${statusFilter} redemption requests.`}
            </p>
          </div>
        ) : (
          <RedemptionTable data={filteredRequests} status={statusFilter} />
        )}
      </div>
    </div>
  );
}
