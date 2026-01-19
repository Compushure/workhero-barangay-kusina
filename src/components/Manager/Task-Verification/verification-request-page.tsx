'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/manager/task-verification/page-header';
import { SearchBar } from '@/components/manager/task-verification/search-bar';
import { SortButton } from '@/components/manager/task-verification/sort-button';
import { RequestsTable } from '@/components/manager/task-verification/requests-table';
import type { VerificationRequest, SortOption } from '@/types/manager-verification-req';
import { ConfirmationDialog } from '@/components/manager/task-verification/confirmation-modal';
import { Pagination } from '@/components/manager/task-verification/pagination';
import {
  useGetTasksToReviewPaginated,
  useGetApprovedTasksPaginated,
  useGetDeniedTasksPaginated,
  useApproveTask,
  useRejectTask,
} from '@/hooks/tanstack';

interface VerificationRequestsPageProps {
  initialRequests: VerificationRequest[];
}

export function VerificationRequestsPage({ initialRequests }: VerificationRequestsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('pending');
  const [pendingPage, setPendingPage] = useState(1);
  const [approvedPage, setApprovedPage] = useState(1);
  const [deniedPage, setDeniedPage] = useState(1);

  // Use paginated Tanstack Query hooks with separate pagination for each category
  const { data: pendingData, isLoading: isLoadingPending } =
    useGetTasksToReviewPaginated(pendingPage);
  const { data: approvedData, isLoading: isLoadingApproved } =
    useGetApprovedTasksPaginated(approvedPage);
  const { data: deniedData, isLoading: isLoadingDenied } = useGetDeniedTasksPaginated(deniedPage);

  const approveTask = useApproveTask();
  const rejectTask = useRejectTask();

  // Extract tasks based on current sort category
  const getCurrentTasks = () => {
    switch (sortBy) {
      case 'pending':
        return pendingData?.data ?? initialRequests;
      case 'approved':
        return approvedData?.data ?? [];
      case 'denied':
        return deniedData?.data ?? [];
      default:
        return initialRequests;
    }
  };

  // Get total pages for current category
  const getTotalPages = () => {
    switch (sortBy) {
      case 'pending':
        return pendingData?.totalPages ?? 1;
      case 'approved':
        return approvedData?.totalPages ?? 1;
      case 'denied':
        return deniedData?.totalPages ?? 1;
      default:
        return 1;
    }
  };

  // Get current page based on sort category
  const getCurrentPage = () => {
    switch (sortBy) {
      case 'pending':
        return pendingPage;
      case 'approved':
        return approvedPage;
      case 'denied':
        return deniedPage;
      default:
        return 1;
    }
  };

  const handlePageChange = (page: number) => {
    switch (sortBy) {
      case 'pending':
        setPendingPage(page);
        break;
      case 'approved':
        setApprovedPage(page);
        break;
      case 'denied':
        setDeniedPage(page);
        break;
    }
  };

  const currentTasks = getCurrentTasks();
  const totalPages = getTotalPages();
  const currentPage = getCurrentPage();

  // Filter requests based on search term (pagination already done server-side by status)
  const filteredRequests = useMemo(() => {
    if (!searchTerm) {
      return currentTasks;
    }

    return currentTasks.filter(
      (req) =>
        req.assigned_to_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.assigned_to_employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currentTasks, searchTerm]);

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

  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'deny' | null;
    id: string | null;
  }>({
    type: null,
    id: null,
  });

  const handleConfirm = () => {
    if (confirmAction.type === 'approve' && confirmAction.id) {
      handleApprove(confirmAction.id);
    }
    if (confirmAction.type === 'deny' && confirmAction.id) {
      handleDeny(confirmAction.id);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex flex-col">
      <PageHeader title="Verification Requests" subtitle="Verify task completion of employee" />

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-end gap-4 mb-6">
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          <SortButton sortBy={sortBy} onSortChange={setSortBy} />
        </div>

        <div className="flex-1 flex flex-col">
          {(isLoadingPending || isLoadingApproved || isLoadingDenied) &&
          filteredRequests.length === 0 ? (
            <div className="text-center py-12">Loading tasks...</div>
          ) : (
            <RequestsTable
              requests={filteredRequests}
              onApprove={(id) => setConfirmAction({ type: 'approve', id })}
              onDeny={(id) => setConfirmAction({ type: 'deny', id })}
              sortBy={sortBy}
              isApproving={approveTask.isPending}
              isRejecting={rejectTask.isPending}
            />
          )}

          {/* Pagination fixed at bottom */}
          <div className="mt-auto pt-4">
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
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
