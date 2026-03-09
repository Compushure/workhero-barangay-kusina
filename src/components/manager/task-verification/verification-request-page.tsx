'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/manager/task-verification/page-header';
import { SearchBar } from '@/components/manager/task-verification/search-bar';
import { SortButton } from '@/components/manager/task-verification/sort-button';
import { RequestsTable } from '@/components/manager/task-verification/requests-table';
import { RequestsTableSkeleton } from '@/components/manager/task-verification/requests-table-skeleton';
import type { VerificationRequest, SortOption } from '@/types';
import { ConfirmationDialog } from '@/components/manager/task-verification/confirmation-modal';
import { Pagination } from '@/components/manager/task-verification/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetTasksToReviewPaginated,
  useGetApprovedTasksPaginated,
  useGetDeniedTasksPaginated,
  useApproveTask,
  useRejectTask,
} from '@/hooks/tanstack';
import { normalizeSearchQuery, sanitizeSearchInput } from '@/lib/utils/search-normalization';

interface VerificationRequestsPageProps {
  initialRequests: VerificationRequest[];
}

export function VerificationRequestsPage({ initialRequests }: VerificationRequestsPageProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('pending');
  const [dateSortBy, setDateSortBy] = useState<
    'date-desc' | 'date-asc' | 'employee-asc' | 'employee-desc'
  >('date-desc');
  const [pendingPage, setPendingPage] = useState(1);
  const [remark, setRemark] = useState('');
  const [approvedPage, setApprovedPage] = useState(1);
  const [deniedPage, setDeniedPage] = useState(1);
  const isSubmittingRef = useRef(false);

  // Use paginated Tanstack Query hooks with separate pagination for each category
  const {
    data: pendingData,
    isLoading: isLoadingPending,
    isError: isPendingError,
  } = useGetTasksToReviewPaginated(pendingPage);
  const {
    data: approvedData,
    isLoading: isLoadingApproved,
    isError: isApprovedError,
  } = useGetApprovedTasksPaginated(approvedPage);
  const {
    data: deniedData,
    isLoading: isLoadingDenied,
    isError: isDeniedError,
  } = useGetDeniedTasksPaginated(deniedPage);

  const approveTask = useApproveTask();
  const rejectTask = useRejectTask();

  useEffect(() => {
    if (isPendingError && isApprovedError && isDeniedError) {
      router.push(
        `/error?status=500&cause=${encodeURIComponent('Failed to load verification requests')}&recommendation=${encodeURIComponent('Please refresh the page or try again later.')}`
      );
    }
  }, [isPendingError, isApprovedError, isDeniedError, router]);

  // Extract tasks based on current sort category - memoized to prevent unnecessary recalculations
  const getCurrentTasks = useMemo(() => {
    switch (sortBy) {
      case 'pending':
        return pendingData?.data ?? [];
      case 'approved':
        return approvedData?.data ?? [];
      case 'denied':
        return deniedData?.data ?? [];
      default:
        return [];
    }
  }, [sortBy, pendingData, approvedData, deniedData]);

  // Get total pages for current category - memoized to prevent unnecessary recalculations
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

  // Get current page based on sort category - memoized to prevent unnecessary recalculations
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

  // Use memoized values directly instead of calling functions
  const currentTasks = getCurrentTasks;
  const totalPages = getTotalPages;
  const currentPage = getCurrentPage;
  const isCurrentCategoryLoading =
    (sortBy === 'pending' && isLoadingPending) ||
    (sortBy === 'approved' && isLoadingApproved) ||
    (sortBy === 'denied' && isLoadingDenied);

  // Filter and sort requests based on search term and date/employee sorting
  const filteredRequests = useMemo(() => {
    let filtered = currentTasks;
    const normalizedSearch = normalizeSearchQuery(searchTerm);

    // Apply search filter
    if (normalizedSearch) {
      filtered = filtered.filter(
        (req) =>
          req.assigned_to_name?.toLowerCase().includes(normalizedSearch) ||
          req.assigned_to_employee_id?.toLowerCase().includes(normalizedSearch) ||
          req.category_name?.toLowerCase().includes(normalizedSearch)
      );
    }

    // Apply date/employee sorting
    return filtered.sort((a, b) => {
      switch (dateSortBy) {
        case 'date-desc': {
          const dateA = new Date(a.kpitask_completed_at || a.kpitask_created_at || 0).getTime();
          const dateB = new Date(b.kpitask_completed_at || b.kpitask_created_at || 0).getTime();
          return dateB - dateA; // Newest first
        }
        case 'date-asc': {
          const dateA = new Date(a.kpitask_completed_at || a.kpitask_created_at || 0).getTime();
          const dateB = new Date(b.kpitask_completed_at || b.kpitask_created_at || 0).getTime();
          return dateA - dateB; // Oldest first
        }
        case 'employee-asc': {
          const nameA = a.assigned_to_name || '';
          const nameB = b.assigned_to_name || '';
          return nameA.localeCompare(nameB); // Alphabetical by employee name
        }
        case 'employee-desc': {
          const nameA = a.assigned_to_name || '';
          const nameB = b.assigned_to_name || '';
          return nameB.localeCompare(nameA);
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
        onSettled: () => {
          isSubmittingRef.current = false;
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
        onSettled: () => {
          isSubmittingRef.current = false;
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
    if (isSubmittingRef.current) return;
    if (!confirmAction.type || !confirmAction.id) return;

    // Close the modal immediately to block further interaction
    resetConfirmState();
    isSubmittingRef.current = true;

    if (confirmAction.type === 'approve') {
      handleApprove(confirmAction.id, remark);
    }
    if (confirmAction.type === 'deny') {
      handleDeny(confirmAction.id, remark);
    }
  };

  const showInitialSkeleton = isCurrentCategoryLoading && currentTasks.length === 0;

  return (
    <div className="px-2 py-3 sm:px-3 sm:py-4 lg:px-6 lg:py-6 bg-zinc-100 min-h-screen flex flex-col">
      {showInitialSkeleton ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 bg-muted" />
          <Skeleton className="h-4 w-80 bg-muted" />
        </div>
      ) : (
        <PageHeader title="Verification Requests" subtitle="Verify task completion of employee" />
      )}

      <div className="flex-1 flex flex-col max-w-7xl 2xl:max-w-440 w-full mx-auto">
        {/* Filter Controls - Compact horizontal layout aligned to right */}
        {showInitialSkeleton ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3 sm:mb-4 mt-3 sm:mt-4 sm:justify-end">
            <div className="flex-1 min-w-0 md:max-w-md lg:max-w-lg sm:flex-initial">
              <Skeleton className="h-9 w-full bg-muted rounded-full" />
            </div>
            <div className="flex gap-2 shrink-0">
              <Skeleton className="h-9 w-24 bg-muted rounded-lg" />
              <Skeleton className="h-9 w-32 bg-muted rounded-lg" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3 sm:mb-4 mt-3 sm:mt-4 sm:justify-end">
            <div className="flex-1 min-w-0 md:max-w-md lg:max-w-lg sm:flex-initial">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={(value) => setSearchTerm(sanitizeSearchInput(value))}
                placeholder="Search by employee name or employee ID"
              />
            </div>
            <div className="flex gap-2 shrink-0">
              <SortButton sortBy={sortBy} onSortChange={setSortBy} styleVariant="mercado" />
              <SortButton
                sortBy={dateSortBy as any}
                onSortChange={(value) =>
                  setDateSortBy(
                    value as 'date-desc' | 'date-asc' | 'employee-asc' | 'employee-desc'
                  )
                }
                options={[
                  { value: 'date-desc' as any, label: 'Date (Newest) - Default' },
                  { value: 'date-asc' as any, label: 'Date (Oldest)' },
                  { value: 'employee-asc' as any, label: 'Employee Name (A-Z)' },
                  { value: 'employee-desc' as any, label: 'Employee Name (Z-A)' },
                ]}
                styleVariant="mercado"
              />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col">
          {isCurrentCategoryLoading ? (
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

          {/* Pagination fixed at bottom */}
          <div className="mt-auto pt-2 sm:pt-3">
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              isFixed={false}
            />
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={confirmAction.id !== null}
        type={confirmAction.type}
        onCancel={() => setConfirmAction({ type: null, id: null })}
        onConfirm={handleConfirm}
        isProcessing={approveTask.isPending || rejectTask.isPending || isSubmittingRef.current}
      />
    </div>
  );
}
