'use client';

import { useState, useMemo, useEffect } from 'react';
import { Check, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/manager/task-verification/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSidebarContentArea } from '@/hooks/useSidebarContentArea';
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

const getRequestQuantity = (request: RedemptionRequest) => request.quantity || 1;
const getRequestTotalCost = (request: RedemptionRequest) =>
  request.pointsCost * getRequestQuantity(request);
const formatPointUnit = (value: number) => (value === 1 ? 'Pt' : 'Pts');
const formatPoints = (value: number) => `${value} ${formatPointUnit(value)}`;

export function RedemptionTable({
  data,
  onApprove,
  onReject,
  status = 'pending',
}: RedemptionTableProps) {
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RedemptionRequest | null>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestImageError, setRequestImageError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { contentAreaStyle } = useSidebarContentArea();
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
  useEffect(() => {
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

  const handleRequestClick = (request: RedemptionRequest) => {
    setSelectedRequest(request);
    setRequestImageError(false);
    setRequestModalOpen(true);
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
      <div className="grid grid-cols-[150px_180px_minmax(200px,1fr)_120px_120px] gap-4 bg-[#690003] px-6 py-4">
        <div className="text-sm font-semibold uppercase tracking-wide text-white">Request Date</div>
        <div className="text-sm font-semibold uppercase tracking-wide text-white">Employee</div>
        <div className="text-sm font-semibold uppercase tracking-wide text-white">
          Requested Item/s
        </div>
        <div className="text-sm font-semibold uppercase tracking-wide text-white text-center">
          Total Cost
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
            const quantity = getRequestQuantity(request);
            const totalCost = getRequestTotalCost(request);
            const itemDisplay = `${quantity} x ${request.rewardName}`;
            const userPoints = request.userPoints || 0;
            const hasInsufficientPoints = userPoints < totalCost;
            const userName = request.userName || 'N/A';
            const isOutOfStock = request.remarks === 'Item is out of stock';

            return (
              <div
                key={request.id}
                className="grid grid-cols-[150px_180px_minmax(200px,1fr)_120px_120px] gap-4 px-6 py-4 transition-colors hover:bg-[#fbeaea] cursor-pointer"
                onClick={() => handleRequestClick(request)}
              >
                <div className="flex flex-col justify-center">
                  <p className="text-sm font-medium text-[#5a2a2a]">{dateStr}</p>
                  <p className="text-xs text-[#7a3d3d]">{timeStr}</p>
                </div>
                <div className="flex items-center">
                  <p className="text-sm text-[#5a2a2a] truncate">{userName}</p>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-sm text-[#5a2a2a] truncate flex-1">{itemDisplay}</p>
                </div>
                <div className="flex items-center justify-center">
                  <p className="text-sm font-medium text-[#5a2a2a]">{formatPoints(totalCost)}</p>
                </div>
                <div
                  className="flex items-center gap-2 justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
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
        <div className="fixed bottom-6 z-40 flex justify-center" style={contentAreaStyle}>
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

      <Dialog open={requestModalOpen} onOpenChange={setRequestModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#690003]">Requested Item</DialogTitle>
          </DialogHeader>
          {selectedRequest &&
            (() => {
              const selectedQuantity = getRequestQuantity(selectedRequest);
              const selectedTotalCost = getRequestTotalCost(selectedRequest);
              const { dateStr, timeStr } = formatDateTime(selectedRequest.requestedAt);
              const requestImageUrl = selectedRequest.rewardImageUrl;

              return (
                <div className="space-y-4 py-2 text-sm text-[#5a2a2a]">
                  <div>
                    <span className="text-xs text-muted-foreground">Requested by: </span>
                    <span className="font-medium">{selectedRequest.userName || 'N/A'}</span>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="h-24 w-24 rounded-xl bg-[#f2e1c9] flex items-center justify-center overflow-hidden">
                      {requestImageUrl && !requestImageError ? (
                        <img
                          src={requestImageUrl}
                          alt={`${selectedRequest.rewardName} image`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={() => setRequestImageError(true)}
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-[#730202]/40" />
                      )}
                    </div>
                    <p className="font-semibold text-base text-center wrap-anywhere">
                      {selectedRequest.rewardName}
                    </p>
                  </div>

                  <div className="grid grid-cols-[1fr_auto_1fr] items-center">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Quantity</p>
                      <p className="font-medium">{selectedQuantity}</p>
                    </div>
                    <div className="h-8 w-px bg-border mx-3" />
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-medium">{formatPoints(selectedTotalCost)}</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Requested at</p>
                    <p className="font-medium">
                      {dateStr} {timeStr}
                    </p>
                  </div>

                  {selectedRequest.status !== 'pending' && (
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Remarks</p>
                      <p className="font-medium whitespace-pre-wrap wrap-anywhere">
                        {selectedRequest.remarks?.trim() || '-'}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
