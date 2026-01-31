'use client';

import { useState, useMemo } from 'react';
import { Check, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Pagination } from '@/components/manager/task-verification/pagination';
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
}

export function RedemptionTable({ data, onApprove, onReject }: RedemptionTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
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

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

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
      <div className="grid grid-cols-[1.5fr_1.5fr_2fr_1fr_1fr] gap-4 bg-[#690003] px-6 py-4">
        <div className="text-sm font-semibold uppercase tracking-wide text-white">Request Date</div>
        <div className="text-sm font-semibold uppercase tracking-wide text-white">Employee</div>
        <div className="text-sm font-semibold uppercase tracking-wide text-white">
          Requested Item/s
        </div>
        <div className="text-sm font-semibold uppercase tracking-wide text-white">Total Cost</div>
        <div className="text-sm font-semibold uppercase tracking-wide text-white">Action</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-border bg-[#fff8f5]">
        {paginatedData.map((request) => {
          const { dateStr, timeStr } = formatDateTime(request.requestedAt);
          const quantity = request.quantity || 1; // Default to 1 if not set
          const totalCost = request.pointsCost * quantity;
          const itemDisplay = `${quantity} x ${request.rewardName}`;
          const userPoints = request.userPoints || 0;
          const hasInsufficientPoints = userPoints < totalCost;

          return (
            <div
              key={request.id}
              className="grid grid-cols-[1.5fr_1.5fr_2fr_1fr_1fr] gap-4 px-6 py-4 transition-colors hover:bg-[#fbeaea]"
            >
              <div className="flex flex-col justify-center">
                <p className="text-sm font-medium text-[#5a2a2a]">{dateStr}</p>
                <p className="text-xs text-[#7a3d3d]">{timeStr}</p>
              </div>
              <div className="flex items-center">
                <p className="text-sm text-[#5a2a2a]">{request.userName}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-[#5a2a2a]">{itemDisplay}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-[#5a2a2a] hover:bg-[#fbeaea]"
                  onClick={() => toggleRow(request.id)}
                >
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      expandedRows.has(request.id) && 'rotate-180'
                    )}
                  />
                </Button>
              </div>
              <div className="flex items-center">
                <p className="text-sm font-medium text-[#5a2a2a]">{totalCost} Pts</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[#8b0000] hover:bg-[#8b0000] hover:text-white"
                  onClick={() => handleDeclineClick(request.id)}
                  disabled={declineMutation.isPending || acceptMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[#2d5016] hover:bg-[#2d5016] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleAcceptClick(request.id)}
                  disabled={
                    declineMutation.isPending || acceptMutation.isPending || hasInsufficientPoints
                  }
                  title={
                    hasInsufficientPoints
                      ? `Insufficient points: User has ${userPoints} but needs ${totalCost}`
                      : 'Accept request'
                  }
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
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
    </div>
  );
}
