'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { MessageSquareMore } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetMyRedemptionRequests } from '@/hooks/tanstack/queries/redemptionQueries';
import type { RedemptionRequest } from '@/types';

interface RewardRequestsFeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type RequestStatusFilter = 'approved' | 'declined';
type SortOrder = 'newest' | 'oldest';
const REQUESTS_PAGE_SIZE = 3;

const CONTROL_TRIGGER_CLASS =
  'h-11 rounded-lg font-pixel text-[14px] bg-[#f7efdf] border-[#9b7a56] text-[#4b3522] focus-visible:ring-[#8a6844]/40 focus-visible:border-[#8a6844] data-[state=open]:border-[#8a6844] data-[state=open]:ring-1 data-[state=open]:ring-[#8a6844]/40';

const CONTROL_CONTENT_CLASS = 'bg-[#f6eddd] border-[#9b7a56] text-[#4b3522] text-[14px]';

const CONTROL_ITEM_CLASS =
  'font-pixel text-[14px] text-[#4b3522] data-[state=checked]:bg-[#d8c29f] data-[state=checked]:text-[#4b3522] data-highlighted:bg-[#ccb389] data-highlighted:text-[#4b3522]';

const EMPLOYEE_CANCELLED_REMARKS = ['cancelled by employee', 'canceled by employee'] as const;

function isEmployeeCancelledRequest(request: RedemptionRequest): boolean {
  const remarks = request.remarks?.trim().toLowerCase() || '';
  return EMPLOYEE_CANCELLED_REMARKS.some((phrase) => remarks.includes(phrase));
}

function matchesRequestSearch(request: RedemptionRequest, normalizedSearch: string): boolean {
  const itemName = (request.requestedItem || request.rewardName || '').toLowerCase();
  const feedback = (request.remarks || '').toLowerCase();

  return itemName.includes(normalizedSearch) || feedback.includes(normalizedSearch);
}

function getRequestTimestampPrefix(status: RedemptionRequest['status']): string {
  if (status === 'approved') return 'Accepted ';
  if (status === 'rejected') return 'Declined ';
  return 'Requested ';
}

function sortRequestsByDate(
  requests: RedemptionRequest[],
  sortOrder: SortOrder
): RedemptionRequest[] {
  return [...requests].sort((first, second) => {
    const firstTime = first.requestedAt ? new Date(first.requestedAt).getTime() : 0;
    const secondTime = second.requestedAt ? new Date(second.requestedAt).getTime() : 0;

    return sortOrder === 'newest' ? secondTime - firstTime : firstTime - secondTime;
  });
}

function RequestSection({
  requests,
  emptyText,
}: {
  requests: RedemptionRequest[];
  emptyText: string;
}) {
  const [expandedRequestIds, setExpandedRequestIds] = useState<Set<string>>(new Set());

  const toggleFeedback = (requestId: string) => {
    setExpandedRequestIds((previous) => {
      const next = new Set(previous);
      if (next.has(requestId)) {
        next.delete(requestId);
      } else {
        next.add(requestId);
      }
      return next;
    });
  };

  return (
    <section className="space-y-2.5">
      {requests.length === 0 ? (
        <div className="kitchen-chip mx-auto max-w-105 px-3 py-2 text-center font-pixel text-[14px]">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-2.5">
          {requests.map((request) => {
            const isExpanded = expandedRequestIds.has(request.id);
            const isApproved = request.status === 'approved';
            const hasFeedback = Boolean(request.remarks?.trim());
            const statusLabel = isApproved ? 'Approved' : 'Declined';
            const statusClasses = isApproved
              ? 'border-[#2f7b4a]/35 bg-[#e3f2e6] text-[#1f5a36]'
              : 'border-[#9b3a3a]/35 bg-[#f8e2e2] text-[#7b2727]';

            return (
              <article
                key={request.id}
                className="rounded-xl border-2 border-[#8ea17f] bg-[#efe8cf] px-3 py-2.5 transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="min-w-0 flex-1 wrap-break-word pr-2 font-pixel text-[15px] leading-relaxed text-[#3f2a1a]">
                    {request.requestedItem || request.rewardName}
                  </p>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-md border px-2 py-0.5 font-pixel text-[14px] uppercase tracking-wide ${statusClasses}`}
                    >
                      {statusLabel}
                    </span>
                    {hasFeedback ? (
                      <button
                        type="button"
                        onClick={() => toggleFeedback(request.id)}
                        aria-label={isExpanded ? 'Hide feedback' : 'Show feedback'}
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-md border transition-colors ${
                          isExpanded
                            ? 'border-[#47331F] bg-[#765332] text-[#f5e8d6]'
                            : 'border-[#9b7a56]/60 bg-[#f3e5cc] text-[#6b5038] hover:bg-[#ecdcbf]'
                        }`}
                      >
                        <MessageSquareMore className="h-4.5 w-4.5" />
                      </button>
                    ) : null}
                  </div>
                </div>

                <p className="font-pixel text-[14px] text-[#6b5038]">
                  Qty {request.quantity} • {request.pointsCost * request.quantity} pts
                </p>

                {hasFeedback && isExpanded && (
                  <div className="mt-1.5 h-20 overflow-y-auto scrollbar-hide rounded-lg border border-[#9b7a56]/30 bg-[#f3e5cc] px-2 py-1.5 animate-in fade-in-0 zoom-in-95 duration-200">
                    <p className="font-pixel text-[14px] text-[#4b3522]">
                      Feedback:
                      <span className="mt-1 block font-medium whitespace-pre-wrap wrap-break-word">
                        {request.remarks?.trim() || 'No feedback provided'}
                      </span>
                    </p>
                  </div>
                )}

                <p className="mt-1 font-pixel text-[14px] text-[#7a5b3f]">
                  {getRequestTimestampPrefix(request.status)}
                  {format(new Date(request.requestedAt), 'MMM dd, yyyy h:mm a')}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function RewardRequestsFeedbackModal({
  open,
  onOpenChange,
}: RewardRequestsFeedbackModalProps) {
  const [statusFilter, setStatusFilter] = useState<RequestStatusFilter>('approved');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { data: requests = [], isLoading } = useGetMyRedemptionRequests('all');

  const { approvedRequests, declinedRequests } = useMemo(() => {
    const approved: RedemptionRequest[] = [];
    const declined: RedemptionRequest[] = [];

    for (const request of requests) {
      if (request.status === 'approved') {
        approved.push(request);
        continue;
      }

      if (request.status === 'rejected' && !isEmployeeCancelledRequest(request)) {
        declined.push(request);
      }
    }

    return {
      approvedRequests: approved,
      declinedRequests: declined,
    };
  }, [requests]);

  const activeRequests = statusFilter === 'approved' ? approvedRequests : declinedRequests;

  const filteredActiveRequests = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return activeRequests;
    }

    return activeRequests.filter((request) => matchesRequestSearch(request, normalizedSearch));
  }, [activeRequests, searchTerm]);

  const sortedActiveRequests = useMemo(() => {
    return sortRequestsByDate(filteredActiveRequests, sortOrder);
  }, [filteredActiveRequests, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedActiveRequests.length / REQUESTS_PAGE_SIZE));

  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * REQUESTS_PAGE_SIZE;
    return sortedActiveRequests.slice(startIndex, startIndex + REQUESTS_PAGE_SIZE);
  }, [sortedActiveRequests, currentPage]);

  const hasReviewedRequests = approvedRequests.length > 0 || declinedRequests.length > 0;

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, sortOrder, searchTerm, open]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleSortOrderChange = (value: string) => {
    if (value === 'newest' || value === 'oldest') {
      setSortOrder(value);
    }
  };

  const handleStatusFilterChange = (value: string) => {
    if (value === 'approved' || value === 'declined') {
      setStatusFilter(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="kitchen-parchment-card w-[94vw] max-w-205 max-h-[82vh] rounded-3xl p-0 gap-0 overflow-hidden"
      >
        <DialogClose
          aria-label="Close"
          className="absolute right-4 top-4 z-10 h-10 w-10 rounded-full bg-[#e4d3b3] text-[#3f2a1a] border-2 border-[#a88961] transition hover:scale-105 hover:bg-[#dcc7a2]"
        >
          ✕
        </DialogClose>

        <DialogHeader className="border-b-2 border-[#8a6844]/30 bg-[#e1d2b7] px-5 py-4 gap-2">
          <DialogTitle className="font-pixel text-[16px] text-[#3f2a1a] leading-relaxed pr-18">
            Reward Request Feedbacks
          </DialogTitle>
          <DialogDescription className="font-pixel text-[14px] leading-relaxed text-[#6b5038] pr-18">
            View your approved and declined reward requests with HR feedback.
          </DialogDescription>

          <Tabs value={statusFilter} onValueChange={handleStatusFilterChange} className="mt-2">
            <TabsList className="mx-auto grid w-full max-w-145 grid-cols-2 rounded-xl border border-[#9b7a56]/45 bg-[#efdec1] p-1">
              <TabsTrigger
                value="approved"
                className="font-pixel text-[14px] data-[state=active]:bg-[#d8efdb] data-[state=active]:text-[#1f5a36] data-[state=active]:border data-[state=active]:border-[#7eb07f]/45"
              >
                Approved ({approvedRequests.length})
              </TabsTrigger>
              <TabsTrigger
                value="declined"
                className="font-pixel text-[14px] data-[state=active]:bg-[#f8e2e2] data-[state=active]:text-[#7b2727] data-[state=active]:border data-[state=active]:border-[#9b3a3a]/35"
              >
                Declined ({declinedRequests.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-2 grid w-full max-w-145 gap-2 sm:grid-cols-[1fr_auto] sm:mx-auto">
            <div className="flex items-center gap-2 w-full">
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search items..."
                className="h-11 w-full rounded-lg border border-[#9b7a56] bg-[#f7efdf] px-3 font-pixel text-[14px]! md:text-[14px]! text-[#4b3522] placeholder:text-[14px] placeholder:text-[#8d7255]"
              />

              <Select value={sortOrder} onValueChange={handleSortOrderChange}>
                <SelectTrigger className={`${CONTROL_TRIGGER_CLASS} w-26`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={CONTROL_CONTENT_CLASS}>
                  <SelectItem value="newest" className={CONTROL_ITEM_CLASS}>
                    Newest
                  </SelectItem>
                  <SelectItem value="oldest" className={CONTROL_ITEM_CLASS}>
                    Oldest
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[58vh] space-y-3 overflow-y-auto px-5 py-3 bg-[#eadbc1]">
          {isLoading ? (
            <p className="font-pixel text-[14px] text-[#6b5038] animate-pulse">Loading request updates...</p>
          ) : !hasReviewedRequests ? (
            <div className="kitchen-chip mx-auto max-w-105 px-3 py-2 text-center font-pixel text-[14px]">
              No approved or declined reward requests yet.
            </div>
          ) : (
            <>
              <RequestSection
                requests={paginatedRequests}
                emptyText={
                  statusFilter === 'approved'
                    ? 'No approved requests yet.'
                    : 'No declined requests yet.'
                }
              />

              {sortedActiveRequests.length > 0 && totalPages > 1 ? (
                <div className="mt-2 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
                    disabled={currentPage === 1}
                    className="h-10 rounded-md border border-[#9b7a56] bg-[#f7efdf] px-4 font-pixel text-[14px] text-[#4b3522] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="font-pixel text-[14px] text-[#6b5038]">
                    {currentPage}/{totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((previous) => Math.min(totalPages, previous + 1))}
                    disabled={currentPage === totalPages}
                    className="h-10 rounded-md border border-[#9b7a56] bg-[#f7efdf] px-4 font-pixel text-[14px] text-[#4b3522] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
