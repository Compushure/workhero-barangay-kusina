'use client';

import { useState, useMemo, useEffect } from 'react';
import { Check, X, ImageIcon, Info, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Pagination } from '@/components/shared/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  const [selectedRequest, setSelectedRequest] = useState<RedemptionRequest | null>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestImageError, setRequestImageError] = useState(false);
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

  const openRequestModal = (request: RedemptionRequest) => {
    setSelectedRequest(request);
    setRequestImageError(false);
    setRequestModalOpen(true);
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

  const getRequestQuantity = (req: RedemptionRequest) => req.quantity || 1;

  const getRequestTotalCost = (req: RedemptionRequest) => (req.quantity || 1) * req.pointsCost;

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-accent/20 bg-card shadow-sm/25">
        <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <Table className="min-w-full">
            <TableHeader className="bg-primary-gradient [&_tr]:border-0">
              <TableRow className="border-0">
                <TableHead className="px-2 py-3 text-[11px] font-semibold uppercase tracking-wide text-card sm:px-4">
                  Request Date
                </TableHead>
                <TableHead className="px-2 py-3 text-[11px] font-semibold uppercase tracking-wide text-card sm:px-4">
                  Employee
                </TableHead>
                <TableHead className="px-2 py-3 text-[11px] font-semibold uppercase tracking-wide text-card sm:px-4">
                  Requested Item/s
                </TableHead>
                <TableHead className="px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-card sm:px-4">
                  Total Cost
                </TableHead>
                <TableHead className="px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-card sm:px-4">
                  Details
                </TableHead>
                <TableHead className="sticky right-0 bg-primary-gradient px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-card sm:px-4">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_tr]:border-0">
              {paginatedData.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="py-12 text-center text-foreground">
                    <p className="text-sm">
                      {status === 'pending'
                        ? 'No pending redemption requests.'
                        : status === 'approved'
                          ? 'No approved redemption requests.'
                          : status === 'rejected'
                            ? 'No rejected redemption requests.'
                            : 'No redemption requests found.'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((request) => {
                  const { dateStr, timeStr } = formatDateTime(request.requestedAt);
                  const quantity = request.quantity || 1;
                  const totalCost = request.pointsCost * quantity;
                  const itemDisplay = `${quantity} x ${request.rewardName}`;
                  const userPoints = request.userPoints || 0;
                  const hasInsufficientPoints = userPoints < totalCost;
                  const userName = request.userName || 'N/A';
                  const isOutOfStock = request.remarks === 'Item is out of stock';
                  const hasRemarks = request.remarks && request.remarks.trim() !== '';

                  return (
                    <TableRow key={request.id} className="border-0 bg-card hover:bg-background">
                      <TableCell className="px-2 py-3 sm:px-4">
                        <p className="text-meta font-semibold text-foreground">{dateStr}</p>
                        <p className="text-[11px] text-muted-foreground">{timeStr}</p>
                      </TableCell>
                      <TableCell className="px-2 py-3 sm:px-4">
                        <p className="text-meta text-foreground truncate max-w-36 sm:max-w-48">
                          {userName}
                        </p>
                      </TableCell>
                      <TableCell className="px-2 py-3 sm:px-4">
                        <p className="text-meta text-foreground truncate max-w-48 sm:max-w-64">
                          {itemDisplay}
                        </p>
                      </TableCell>
                      <TableCell className="px-2 py-3 text-center sm:px-4">
                        <p className="text-button font-semibold text-foreground whitespace-nowrap">
                          {totalCost} Pts
                        </p>
                      </TableCell>
                      <TableCell className="px-2 py-3 text-center sm:px-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0 rounded-xl border border-accent/30 bg-accent/10 text-accent transition-all duration-200 hover:bg-accent hover:text-white"
                          onClick={() => openRequestModal(request)}
                          title="View details"
                        >
                          <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          {status !== 'pending' && hasRemarks && (
                            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-orange-500 ring-1 ring-background" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="sticky right-0 bg-card px-2 py-3 sm:px-4">
                        <div className="flex items-center justify-center gap-2">
                          {status === 'pending' ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 transition-all duration-200 hover:bg-emerald-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleAcceptClick(request.id);
                                }}
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
                                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 shrink-0 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleDeclineClick(request.id);
                                }}
                                disabled={declineMutation.isPending || acceptMutation.isPending}
                              >
                                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                            </>
                          ) : (
                            <div
                              className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap shrink-0 ${
                                status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-700'
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
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination - parent will position with mt-auto */}
      {totalPages > 1 && (
        <div className="mt-auto pt-3 sm:pt-4">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            isFixed={false}
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
        <DialogContent className="bg-background text-card-foreground border border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">Requested Item</DialogTitle>
          </DialogHeader>
          {selectedRequest &&
            (() => {
              const selectedQuantity = getRequestQuantity(selectedRequest);
              const selectedTotalCost = getRequestTotalCost(selectedRequest);
              const { dateStr, timeStr } = formatDateTime(selectedRequest.requestedAt);
              const requestImageUrl = selectedRequest.rewardImageUrl;

              const formatPoints = (points: number) => `${points} Pts`;

              return (
                <div className="space-y-4 py-2 text-sm text-foreground">
                  <div>
                    <span className="text-xs text-muted-foreground">Requested by: </span>
                    <span className="font-medium">{selectedRequest.userName || 'N/A'}</span>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="h-24 w-24 rounded-xl bg-background flex items-center justify-center overflow-hidden">
                      {requestImageUrl && !requestImageError ? (
                        <img
                          src={requestImageUrl}
                          alt={`${selectedRequest.rewardName} image`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={() => setRequestImageError(true)}
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
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
    </>
  );
}
