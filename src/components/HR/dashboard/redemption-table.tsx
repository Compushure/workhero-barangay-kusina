'use client';

import { useState, useMemo } from 'react';
import { Check, X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Pagination } from '@/components/manager/task-verification/pagination';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  useAcceptRedemptionRequest,
  useDeclineRedemptionRequest,
} from '@/hooks/tanstack/mutations/hrMutations';
import { RemarksDialog } from './remarks';
import type { RedemptionRequest } from '@/types';

interface RedemptionTableProps {
  data: RedemptionRequest[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  status?: string;
}

export function RedemptionTable({
  data,
  onApprove,
  onReject,
  status = 'pending',
}: RedemptionTableProps) {
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [remarkModalOpen, setRemarkModalOpen] = useState(false);
  const [selectedRemarks, setSelectedRemarks] = useState<string>('');
  const itemsPerPage = 8;

  // Pagination logic
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = useMemo(
    () => data.slice(startIndex, endIndex),
    [data, startIndex, endIndex]
  );

  // Reset to page 1 when data changes and current page is invalid
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [data.length, currentPage, totalPages]);

  const declineMutation = useDeclineRedemptionRequest();
  const acceptMutation = useAcceptRedemptionRequest();

  const handleAcceptClick = (requestId: string) => {
    setSelectedRequestId(requestId);
    setAcceptDialogOpen(true);
  };

  const handleDeclineClick = (requestId: string) => {
    setSelectedRequestId(requestId);
    setDeclineDialogOpen(true);
  };

  const handleAcceptConfirm = (remarks?: string) => {
    if (selectedRequestId) {
      acceptMutation.mutate({ id: selectedRequestId, remarks });
      setSelectedRequestId(null);
      setAcceptDialogOpen(false); // close to prevent repeat clicks
    }
  };

  const handleDeclineConfirm = (remarks?: string) => {
    if (selectedRequestId) {
      declineMutation.mutate({ id: selectedRequestId, remarks });
      setSelectedRequestId(null);
      setDeclineDialogOpen(false); // close to prevent repeat clicks
    }
  };

  // Format date and time from ISO string
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return { dateStr, timeStr };
  };

  return (
    <div className="overflow-hidden rounded-lg shadow-md">
      {/* Table Header */}
      <div className="grid grid-cols-[150px_180px_minmax(200px,1fr)_120px_80px_120px] gap-4 bg-[#690003] px-6 py-4">
        <div className="text-sm font-semibold uppercase tracking-wide text-white">Request Date</div>
        <div className="text-sm font-semibold uppercase tracking-wide text-white">Employee</div>
        <div className="text-sm font-semibold uppercase tracking-wide text-white">
          Requested Item/s
        </div>
        <div className="text-sm font-semibold uppercase tracking-wide text-white text-center">
          Total Cost
        </div>
        <div className="text-sm font-semibold uppercase tracking-wide text-white text-center">
          Remarks
        </div>
        <div className="text-sm font-semibold uppercase tracking-wide text-white text-center">
          Action
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-border bg-[#fff8f5]">
        {paginatedData.length === 0 ? (
          <div className="flex items-center justify-center px-6 py-12 text-[#5a2a2a]">
            <p className="text-sm">
              {status === 'pending'
                ? 'No pending redemption requests.'
                : status === 'approved'
                  ? 'No approved redemption requests.'
                  : status === 'rejected'
                    ? 'No rejected redemption requests.'
                    : 'No redemption requests found.'}
            </p>
          </div>
        ) : (
          paginatedData.map((request) => {
            const { dateStr, timeStr } = formatDateTime(request.requestedAt);
            const quantity = request.quantity || 1;
            const totalCost = request.pointsCost * quantity;
            const itemDisplay = `${quantity} x ${request.rewardName}`;
            const userPoints = request.userPoints || 0;
            const hasInsufficientPoints = userPoints < totalCost;
            const hasRemarks = request.remarks && request.remarks.trim() !== '';
            const userName = request.userName || 'N/A';
            const isOutOfStock = request.remarks === 'Item is out of stock';

            return (
              <div
                key={request.id}
                className="grid grid-cols-[150px_180px_minmax(200px,1fr)_120px_80px_120px] gap-4 px-6 py-4 transition-colors hover:bg-[#fbeaea]"
              >
                <div className="flex flex-col justify-center">
                  <p className="text-sm font-medium text-[#5a2a2a]">{dateStr}</p>
                  <p className="text-xs text-[#7a3d3d]">{timeStr}</p>
                </div>
                <div className="flex items-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-sm text-[#5a2a2a] truncate">{userName}</p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-xs">{userName}</div>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-sm text-[#5a2a2a] truncate flex-1">{itemDisplay}</p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-xs">{itemDisplay}</div>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center justify-center">
                  <p className="text-sm font-medium text-[#5a2a2a]">{totalCost} Pts</p>
                </div>
                <div className="flex items-center justify-center">
                  {hasRemarks ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            'h-8 w-8 hover:bg-[#fbeaea]',
                            isOutOfStock ? 'text-orange-600' : 'text-[#690003]'
                          )}
                          onClick={() => {
                            setSelectedRemarks(request.remarks || '');
                            setRemarkModalOpen(true);
                          }}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isOutOfStock ? 'Auto-declined: Out of stock' : 'View remarks'}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>
                <div className="flex items-center gap-2 justify-center">
                  {status === 'pending' ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-[#2d5016] hover:bg-[#2d5016] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleAcceptClick(request.id)}
                        disabled={
                          declineMutation.isPending ||
                          acceptMutation.isPending ||
                          hasInsufficientPoints
                        }
                        title={
                          hasInsufficientPoints
                            ? `Insufficient points: User has ${userPoints} but needs ${totalCost}`
                            : 'Accept request'
                        }
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-[#8b0000] hover:bg-[#8b0000] hover:text-white"
                        onClick={() => handleDeclineClick(request.id)}
                        disabled={declineMutation.isPending || acceptMutation.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${
                        status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : isOutOfStock
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {status === 'approved'
                        ? 'Approved'
                        : isOutOfStock
                          ? 'Out of Stock'
                          : 'Rejected'}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-[#fff8f5] py-4">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Remarks Dialogs */}
      <RemarksDialog
        open={acceptDialogOpen}
        onOpenChange={setAcceptDialogOpen}
        onConfirm={handleAcceptConfirm}
        title="Accept Request (Optional Remark)"
        description="If you wish to continue with the acceptance without any remarks, simply click OK."
        placeholder="Type in any comments you wish to send alongside the acceptance."
        isProcessing={acceptMutation.isPending || declineMutation.isPending}
      />

      <RemarksDialog
        open={declineDialogOpen}
        onOpenChange={setDeclineDialogOpen}
        onConfirm={handleDeclineConfirm}
        title="Decline Request"
        description="Please provide a reason for declining this request. This will help the employee understand the decision."
        placeholder="Enter remarks explaining the denial (required)"
        required={true}
        confirmVariant="destructive"
        isProcessing={acceptMutation.isPending || declineMutation.isPending}
      />

      {/* Remarks Display Modal */}
      <Dialog open={remarkModalOpen} onOpenChange={setRemarkModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#690003]">Request Remarks</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-[#5a2a2a] whitespace-pre-wrap wrap-anywhere">
              {selectedRemarks}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
