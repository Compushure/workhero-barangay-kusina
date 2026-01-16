'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/Manager/Task-Verification/page-header';
import { SearchBar } from '@/components/Manager/Task-Verification/search-bar';
import { SortButton } from '@/components/Manager/Task-Verification/sort-button';
import { RequestsTable } from '@/components/Manager/Task-Verification/requests-table';
import type { VerificationRequest, SortOption } from '@/types/manager-verification-req';
import { filterRequests } from '@/lib/utils/filter-requests';
import { ConfirmationDialog } from '@/components/Manager/Task-Verification/confirmation-modal';
import { Pagination } from '@/components/Manager/Task-Verification/pagination';

interface VerificationRequestsPageProps {
  initialRequests: VerificationRequest[];
}

export function VerificationRequestsPage({ initialRequests }: VerificationRequestsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('pending');
  const [statuses, setStatuses] = useState<Map<string, 'approved' | 'denied'>>(new Map());
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 7;

  const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'deny' | null; id: string | null }>({
    type: null,
    id: null,
  });

  const filteredAndSortedRequests = useMemo(
    () => filterRequests(initialRequests, searchTerm, sortBy, statuses),
    [searchTerm, sortBy, statuses, initialRequests]
  );

  const totalPages = Math.ceil(filteredAndSortedRequests.length / requestsPerPage);

  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * requestsPerPage;
    const end = start + requestsPerPage;
    return filteredAndSortedRequests.slice(start, end);
  }, [currentPage, filteredAndSortedRequests]);

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

  const handleConfirm = () => {
    if (confirmAction.type === 'approve' && confirmAction.id) handleApprove(confirmAction.id);
    if (confirmAction.type === 'deny' && confirmAction.id) handleDeny(confirmAction.id);
    setConfirmAction({ type: null, id: null });
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex flex-col">
      <PageHeader title="Verification Requests" subtitle="Verify task completion of employee" />

      <div className="mt-6 p-6 flex flex-col grow justify-between">
        <div>
          <div className="flex items-center justify-end gap-4 mb-6">
            <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            <SortButton sortBy={sortBy} onSortChange={setSortBy} />
          </div>

          <RequestsTable
            requests={paginatedRequests}
            onApprove={(id) => setConfirmAction({ type: 'approve', id })}
            onDeny={(id) => setConfirmAction({ type: 'deny', id })}
            statuses={statuses}
            sortBy={sortBy}
          />
        </div>

        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      <ConfirmationDialog
        open={!!confirmAction.type}
        type={confirmAction.type}
        onCancel={() => setConfirmAction({ type: null, id: null })}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
