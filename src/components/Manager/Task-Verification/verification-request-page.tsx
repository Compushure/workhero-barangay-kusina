'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/manager/Task-Verification/page-header';
import { SearchBar } from '@/components/manager/Task-Verification/search-bar';
import { SortButton } from '@/components/manager/Task-Verification/sort-button';
import { RequestsTable } from '@/components/manager/Task-Verification/requests-table';
import type { VerificationRequest, SortOption } from '@/types/manager-verification-req';
import { filterRequests } from '@/lib/utils/filter-requests';
import { ConfirmationDialog } from '@/components/manager/Task-Verification/confirmation-modal';
import { Pagination } from '@/components/manager/Task-Verification/pagination';
import { useGetTasksToReview, useApproveTask, useRejectTask } from '@/hooks/tanstack';

interface VerificationRequestsPageProps {
  initialRequests: VerificationRequest[];
}

export function VerificationRequestsPage({ initialRequests }: VerificationRequestsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 7;

  // Use Tanstack Query to manage tasks
  const { data: tasks, isLoading, refetch } = useGetTasksToReview();
  const approveTask = useApproveTask();
  const rejectTask = useRejectTask();

  // Use server data initially, then switch to query data
  const requests = tasks ?? initialRequests;

  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'deny' | null;
    id: string | null;
  }>({
    type: null,
    id: null,
  });

  // Filter requests based on status
  const filteredRequests = useMemo(() => {
    let filtered = requests;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (req) =>
          req.assigned_to_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.assigned_to_employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (sortBy === 'pending') {
      filtered = filtered.filter((req) => req.status === 'in review');
    } else if (sortBy === 'approved') {
      filtered = filtered.filter((req) => req.status === 'approved');
    } else if (sortBy === 'denied') {
      filtered = filtered.filter((req) => req.status === 'rejected');
    }

    return filtered;
  }, [requests, searchTerm, sortBy]);

  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);

  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * requestsPerPage;
    const end = start + requestsPerPage;
    return filteredRequests.slice(start, end);
  }, [currentPage, filteredRequests]);

  const handleApprove = (id: string) => {
    approveTask.mutate(id, {
      onSuccess: () => {
        setConfirmAction({ type: null, id: null });
      },
    });
  };

  const handleDeny = (id: string) => {
    rejectTask.mutate(id, {
      onSuccess: () => {
        setConfirmAction({ type: null, id: null });
      },
    });
  };

  const handleConfirm = () => {
    if (confirmAction.type === 'approve' && confirmAction.id) {
      handleApprove(confirmAction.id);
    }
    if (confirmAction.type === 'deny' && confirmAction.id) {
      handleDeny(confirmAction.id);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <PageHeader title="Verification Requests" subtitle="Verify task completion of employee" />

      <div className="mt-6 p-6">
        <div className="flex items-center justify-end gap-4 mb-6">
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          <SortButton sortBy={sortBy} onSortChange={setSortBy} />
        </div>

        {isLoading && !tasks ? (
          <div className="text-center py-12">Loading tasks...</div>
        ) : (
          <RequestsTable
            requests={paginatedRequests}
            onApprove={(id) => setConfirmAction({ type: 'approve', id })}
            onDeny={(id) => setConfirmAction({ type: 'deny', id })}
            sortBy={sortBy}
            isApproving={approveTask.isPending}
            isRejecting={rejectTask.isPending}
          />
        )}

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
