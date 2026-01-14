'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/Manager/Task-Verification/page-header';
import { SearchBar } from '@/components/Manager/Task-Verification/search-bar';
import { SortButton } from '@/components/Manager/Task-Verification/sort-button';
import { RequestsTable } from '@/components/Manager/Task-Verification/requests-table';
import type { VerificationRequest, SortOption } from '@/types/manager-verification-req';
import { filterRequests } from '@/lib/utils/filter-requests';

interface VerificationRequestsPageProps {
  initialRequests: VerificationRequest[];
}

export function VerificationRequestsPage({ initialRequests }: VerificationRequestsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('pending');
  const [statuses, setStatuses] = useState<Map<string, 'approved' | 'denied'>>(new Map());

  const filteredAndSortedRequests = useMemo(
    () => filterRequests(initialRequests, searchTerm, sortBy, statuses),
    [searchTerm, sortBy, statuses, initialRequests]
  );

  const handleApprove = (id: string) => {
    setStatuses((prev) => {
      const newMap = new Map(prev);
      newMap.set(id, 'approved');
      return newMap;
    });
  };

  const handleDeny = (id: string) => {
    setStatuses((prev) => {
      const newMap = new Map(prev);
      newMap.set(id, 'denied');
      return newMap;
    });
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <PageHeader title="Verification Requests" subtitle="Verify task completion of employee" />

      <div className="mt-6 p-6">
        <div className="flex items-center justify-end gap-4 mb-6">
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          <SortButton sortBy={sortBy} onSortChange={setSortBy} />
        </div>
        <RequestsTable
          requests={filteredAndSortedRequests}
          onApprove={handleApprove}
          onDeny={handleDeny}
          statuses={statuses}
          sortBy={sortBy}
        />
      </div>
    </div>
  );
}
