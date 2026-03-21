'use client';

import { useMemo, useState } from 'react';
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
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGetMyRedemptionRequests } from '@/hooks/tanstack/queries/redemptionQueries';
import type { RedemptionRequest } from '@/types';

interface RewardRequestsFeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type RequestStatusFilter = 'approved' | 'declined';
type SortOrder = 'newest' | 'oldest';

const CONTROL_TRIGGER_CLASS =
  'h-8 text-xs bg-[#f6eddd] border-[#9b7a56] text-[#4b3522] focus-visible:ring-[#8a6844]/40 focus-visible:border-[#8a6844] data-[state=open]:border-[#8a6844] data-[state=open]:ring-1 data-[state=open]:ring-[#8a6844]/40';

const CONTROL_CONTENT_CLASS = 'bg-[#f6eddd] border-[#9b7a56] text-[#4b3522]';

const CONTROL_ITEM_CLASS =
  'text-[#4b3522] data-[state=checked]:bg-[#d8c29f] data-[state=checked]:text-[#4b3522] data-highlighted:bg-[#ccb389] data-highlighted:text-[#4b3522]';

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
    <section className="space-y-2">
      {requests.length === 0 ? (
        <div className="rounded-md border border-[#9b7a56]/35 bg-[#f7efdf] px-3 py-2 text-xs text-[#7a5b3f]">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-2">
          {requests.map((request) => {
            const isExpanded = expandedRequestIds.has(request.id);

            return (
              <article
                key={request.id}
                className="rounded-md border border-[#9b7a56]/35 bg-[#f7efdf] px-3 py-2"
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <p className="min-w-0 flex-1 wrap-break-word pr-2 text-sm font-semibold leading-tight text-[#3f2a1a]">
                    {request.requestedItem || request.rewardName}
                  </p>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleFeedback(request.id)}
                      aria-label={isExpanded ? 'Hide feedback' : 'Show feedback'}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-sm border transition-colors ${
                        isExpanded
                          ? 'border-[#47331F] bg-[#765332] text-[#f5e8d6]'
                          : 'border-[#9b7a56]/60 bg-[#f3e5cc] text-[#6b5038] hover:bg-[#ecdcbf]'
                      }`}
                    >
                      <MessageSquareMore className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#6b5038]">
                  Qty {request.quantity} • {request.pointsCost * request.quantity} pts
                </p>

                {isExpanded && (
                  <div className="mt-1 rounded-sm border border-[#9b7a56]/30 bg-[#f3e5cc] px-2 py-1">
                    <p className="text-xs text-[#4b3522]">
                      Feedback:{' '}
                      <span className="font-medium break-all">
                        {request.remarks?.trim() || 'No feedback provided'}
                      </span>
                    </p>
                  </div>
                )}

                <p className="mt-1 text-[11px] text-[#7a5b3f]">
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

  const hasReviewedRequests = approvedRequests.length > 0 || declinedRequests.length > 0;

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
      <DialogContent className="w-[40vw] max-w-[40vw] sm:max-w-[40vw] md:max-w-[40vw] lg:max-w-[40vw] rounded-2xl border-[#8a6844] bg-[#eadbc1] p-0 overflow-hidden">
        <DialogHeader className="border-b border-[#8a6844]/30 bg-[#e1d2b7] px-5 py-4">
          <DialogTitle className="text-lg font-bold text-[#3f2a1a]">
            Reward Request Feedbacks
          </DialogTitle>
          <DialogDescription className="text-xs text-[#6b5038]">
            View your approved and declined reward requests with HR feedback.
          </DialogDescription>
          <div className="mt-3 flex w-full items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search items..."
                className="h-8 w-44 sm:w-52 text-xs bg-[#f6eddd] border-[#9b7a56] text-[#4b3522] placeholder:text-[#8d7255]"
              />

              <Select value={sortOrder} onValueChange={handleSortOrderChange}>
                <SelectTrigger className={`${CONTROL_TRIGGER_CLASS} w-28`}>
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

            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className={`${CONTROL_TRIGGER_CLASS} w-52`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={CONTROL_CONTENT_CLASS}>
                <SelectItem value="approved" className={CONTROL_ITEM_CLASS}>
                  Approved ({approvedRequests.length})
                </SelectItem>
                <SelectItem value="declined" className={CONTROL_ITEM_CLASS}>
                  Declined ({declinedRequests.length})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <p className="text-sm text-[#6b5038]">Loading request updates...</p>
          ) : !hasReviewedRequests ? (
            <div className="rounded-md border border-[#9b7a56]/35 bg-[#f7efdf] px-3 py-2 text-sm text-[#6b5038]">
              No approved or declined reward requests yet.
            </div>
          ) : (
            <RequestSection
              requests={sortedActiveRequests}
              emptyText={
                statusFilter === 'approved'
                  ? 'No approved requests yet.'
                  : 'No declined requests yet.'
              }
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
