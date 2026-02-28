'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/manager/task-verification/page-header';
import { SearchBar } from '@/components/manager/task-verification/search-bar';
import { SortButton } from '@/components/manager/task-verification/sort-button';
import { RequestsTable } from '@/components/manager/task-verification/requests-table';
import { RequestsTableSkeleton } from '@/components/manager/task-verification/requests-table-skeleton';
import type { VerificationRequest, SortOption } from '@/types';
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
  const [dateSortBy, setDateSortBy] = useState<'date-desc' | 'date-asc' | 'employee'>('date-desc');
  const [pendingPage, setPendingPage] = useState(1);
  const [remark, setRemark] = useState('');
  const [approvedPage, setApprovedPage] = useState(1);
  const [deniedPage, setDeniedPage] = useState(1);

  // Queries
  const { data: pendingData, isLoading: isLoadingPending } =
    useGetTasksToReviewPaginated(pendingPage);
  const { data: approvedData, isLoading: isLoadingApproved } =
    useGetApprovedTasksPaginated(approvedPage);
  const { data: deniedData, isLoading: isLoadingDenied } = useGetDeniedTasksPaginated(deniedPage);

  const approveTask = useApproveTask();
  const rejectTask = useRejectTask();

  // Extract tasks based on current sort category
  const getCurrentTasks = useMemo(() => {
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
  }, [sortBy, pendingData, approvedData, deniedData, initialRequests]);

  const getTotalPages = useMemo(() => {
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
  }, [sortBy, pendingData, approvedData, deniedData]);

  const getCurrentPage = useMemo(() => {
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
  }, [sortBy, pendingPage, approvedPage, deniedPage]);

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

  const currentTasks = getCurrentTasks;
  const totalPages = getTotalPages;
  const currentPage = getCurrentPage;

  const filteredRequests = useMemo(() => {
    let filtered = currentTasks;
    if (searchTerm) {
      filtered = filtered.filter(
        (req) =>
          req.assigned_to_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.assigned_to_employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered.sort((a, b) => {
      switch (dateSortBy) {
        case 'date-desc': {
          const dateA = new Date(a.kpitask_completed_at || a.kpitask_created_at || 0).getTime();
          const dateB = new Date(b.kpitask_completed_at || b.kpitask_created_at || 0).getTime();
          return dateB - dateA;
        }
        case 'date-asc': {
          const dateA = new Date(a.kpitask_completed_at || a.kpitask_created_at || 0).getTime();
          const dateB = new Date(b.kpitask_completed_at || b.kpitask_created_at || 0).getTime();
          return dateA - dateB;
        }
        case 'employee': {
          const nameA = a.assigned_to_name || '';
          const nameB = b.assigned_to_name || '';
          return nameA.localeCompare(nameB);
        }
        default:
          return 0;
      }
    });
  }, [currentTasks, searchTerm, dateSortBy]);

  const resetConfirmState = () => setConfirmAction({ type: null, id: null });

  const handleApprove = (id: string, remarkText: string) => {
    approveTask.mutate(
      { id, remark: remarkText },
      {
        onSuccess: () => {
          resetConfirmState();
          setRemark('');
        },
      }
    );
  };

  const handleDeny = (id: string, remarkText: string) => {
    rejectTask.mutate(
      { id, remark: remarkText },
      {
        onSuccess: () => {
          resetConfirmState();
          setRemark('');
        },
      }
    );
  };

  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'deny' | null;
    id: string | null;
  }>({
    type: null,
    id: null,
  });

  const handleConfirm = (remark: string) => {
    if (!confirmAction.type || !confirmAction.id) return;
    resetConfirmState();
    if (confirmAction.type === 'approve') {
      handleApprove(confirmAction.id, remark);
    }
    if (confirmAction.type === 'deny') {
      handleDeny(confirmAction.id, remark);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex flex-col">
      <PageHeader title="Verification Requests" subtitle="Verify task completion of employee" />

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-end gap-2 mb-6">
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          <SortButton sortBy={sortBy} onSortChange={setSortBy} />
          <SortButton
            sortBy={dateSortBy as any}
            onSortChange={(value) => setDateSortBy(value as 'date-desc' | 'date-asc' | 'employee')}
            options={[
              { value: 'date-desc' as any, label: 'Date (Newest) - Default' },
              { value: 'date-asc' as any, label: 'Date (Oldest)' },
              { value: 'employee' as any, label: 'Employee Name' },
            ]}
          />
        </div>

        <div className="flex-1 flex flex-col">
          {(isLoadingPending || isLoadingApproved || isLoadingDenied) &&
          filteredRequests.length === 0 ? (
            <RequestsTableSkeleton />
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
        open={confirmAction.id !== null}
        type={confirmAction.type}
        onCancel={() => setConfirmAction({ type: null, id: null })}
        onConfirm={handleConfirm}
        isProcessing={approveTask.isPending || rejectTask.isPending}
      />
    </div>
  );
}
