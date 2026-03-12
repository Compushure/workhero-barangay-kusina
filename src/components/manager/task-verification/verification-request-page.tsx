'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowUpDown } from 'lucide-react';
import { PageHeader } from '@/components/manager/task-verification/page-header';
import { SearchBar } from '@/components/manager/task-verification/search-bar';
import { SortButton } from '@/components/manager/task-verification/sort-button';
import { RequestsTable } from '@/components/manager/task-verification/requests-table';
import { RequestsTableSkeleton } from '@/components/manager/task-verification/requests-table-skeleton';
import type { VerificationRequest, SortOption, PaginatedResponse } from '@/types';
import { ConfirmationDialog } from '@/components/manager/task-verification/confirmation-modal';
import { Pagination } from '@/components/manager/task-verification/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useGetTasksToReviewPaginated,
  useGetApprovedTasksPaginated,
  useGetDeniedTasksPaginated,
  useApproveTask,
  useRejectTask,
} from '@/hooks/tanstack';
import { normalizeSearchQuery, sanitizeSearchInput } from '@/lib/utils/search-normalization';
import { useDebounce } from '@/hooks/useDebounce';

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

  // Keep last fetched page per category so UI does not flash/skeleton while searching
  const [pendingCache, setPendingCache] = useState<PaginatedResponse<VerificationRequest> | null>(
    null
  );
  const [approvedCache, setApprovedCache] = useState<PaginatedResponse<VerificationRequest> | null>(
    null
  );
  const [deniedCache, setDeniedCache] = useState<PaginatedResponse<VerificationRequest> | null>(
    null
  );

  // Debounce search to avoid refetching on every keystroke
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Use paginated Tanstack Query hooks with separate pagination for each category
  const {
    data: pendingData,
    isLoading: isLoadingPending,
    isError: isPendingError,
  } = useGetTasksToReviewPaginated(pendingPage, debouncedSearch, dateSortBy);
  const {
    data: approvedData,
    isLoading: isLoadingApproved,
    isError: isApprovedError,
  } = useGetApprovedTasksPaginated(approvedPage, debouncedSearch, dateSortBy);
  const {
    data: deniedData,
    isLoading: isLoadingDenied,
    isError: isDeniedError,
  } = useGetDeniedTasksPaginated(deniedPage, debouncedSearch, dateSortBy);

  const approveTask = useApproveTask();
  const rejectTask = useRejectTask();

  useEffect(() => {
    if (pendingData) setPendingCache(pendingData);
  }, [pendingData]);

  useEffect(() => {
    if (approvedData) setApprovedCache(approvedData);
  }, [approvedData]);

  useEffect(() => {
    if (deniedData) setDeniedCache(deniedData);
  }, [deniedData]);

  const pendingDisplay = pendingData ?? pendingCache;
  const approvedDisplay = approvedData ?? approvedCache;
  const deniedDisplay = deniedData ?? deniedCache;

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
        return pendingDisplay?.data ?? [];
      case 'approved':
        return approvedDisplay?.data ?? [];
      case 'denied':
        return deniedDisplay?.data ?? [];
      default:
        return [];
    }
  }, [sortBy, pendingDisplay, approvedDisplay, deniedDisplay]);

  // Get total pages for current category - memoized to prevent unnecessary recalculations
  const getTotalPages = useMemo(() => {
    switch (sortBy) {
      case 'pending':
        return pendingDisplay?.totalPages ?? 1;
      case 'approved':
        return approvedDisplay?.totalPages ?? 1;
      case 'denied':
        return deniedDisplay?.totalPages ?? 1;
      default:
        return 1;
    }
  }, [sortBy, pendingDisplay, approvedDisplay, deniedDisplay]);

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
    (sortBy === 'pending' && isLoadingPending && !pendingDisplay) ||
    (sortBy === 'approved' && isLoadingApproved && !approvedDisplay) ||
    (sortBy === 'denied' && isLoadingDenied && !deniedDisplay);

  // Filter and sort requests based on search term and date/employee sorting
  const filteredRequests = useMemo(() => {
    let filtered = currentTasks;
    const normalizedSearch = normalizeSearchQuery(debouncedSearch);

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
  }, [currentTasks, debouncedSearch, dateSortBy]);

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
          <Skeleton className="h-8 w-64 bg-background" />
          <Skeleton className="h-4 w-80 bg-background" />
        </div>
      ) : (
        <PageHeader title="Verification Requests" subtitle="Verify task completion of employee" />
      )}

      <div className="flex-1 flex flex-col max-w-7xl 2xl:max-w-440 w-full mx-auto">
        {/* Filter Controls - Compact horizontal layout aligned to right */}
        {showInitialSkeleton ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3 sm:mb-4 mt-3 sm:mt-4 sm:justify-end">
            <div className="flex-1 min-w-0 md:max-w-md lg:max-w-lg sm:flex-initial">
              <Skeleton className="h-9 w-full bg-background rounded-full" />
            </div>
            <div className="flex gap-2 shrink-0">
              <Skeleton className="h-9 w-24 bg-background rounded-lg" />
              <Skeleton className="h-9 w-32 bg-background rounded-lg" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3 sm:mb-4 mt-3 sm:mt-4 sm:justify-end">
            <div className="flex-1 min-w-80 md:max-w-2xl lg:max-w-3xl sm:flex-initial">
              <div className="relative flex">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 size-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by employee name or ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(sanitizeSearchInput(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 rounded-full text-xs bg-card shadow-sm/25 focus:outline-none focus:border focus:border-accent transition-colors sm:w-50 md:w-75"
                />
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <SortButton sortBy={sortBy} onSortChange={setSortBy} styleVariant="default" />
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
                styleVariant="default"
              />
              {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="default"
                    size="default"
                    className="bg-card shadow-sm/25 hover:bg-gray-200 transition-all duration-200 ease-in-out cursor-pointer text-primary shadow-md w-full sm:w-40 py-1.5 justify-between border border-gray-200 h-8 text-xs"
                  >
                    <span className="truncate">Default</span>
                    <ArrowUpDown size={14} className="text-accent" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background w-48">
                  <DropdownMenuItem className="cursor-pointer transition-all duration-300 ease-in-out text-xs">
                    Default
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer transition-all duration-300 ease-in-out text-xs">
                    Employee Name (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer transition-all duration-300 ease-in-out text-xs">
                    Employee Name (Z-A)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="default"
                    size="default"
                    className="bg-card shadow-sm/25 hover:bg-gray-200 transition-all duration-200 ease-in-out cursor-pointer text-primary shadow-md w-full sm:w-40 py-1.5 justify-between border border-gray-200 h-8 text-xs"
                  >
                    <span className="truncate">Date (Newest)</span>
                    <ArrowUpDown size={14} className="text-accent" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background w-48">
                  <DropdownMenuItem className="cursor-pointer transition-all duration-300 ease-in-out text-xs">
                    Date (Newest) - Default
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer transition-all duration-300 ease-in-out text-xs">
                    Date (Oldest)
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer transition-all duration-300 ease-in-out text-xs">
                    Employee Name (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer transition-all duration-300 ease-in-out text-xs">
                    Employee Name (Z-A)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> */}
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
