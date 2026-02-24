'use client';

import { useState, useMemo } from 'react';
import { Check, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  useAcceptRedemptionRequest,
  useDeclineRedemptionRequest,
} from '@/hooks/tanstack/mutations/hrMutations';
import type { RedemptionRequest } from '@/types';

interface RedemptionTableProps {
  data: RedemptionRequest[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function RedemptionTable({ data, onApprove, onReject }: RedemptionTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Calculate pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = useMemo(
    () => data.slice(startIndex, endIndex),
    [data, startIndex, endIndex]
  );

  // Reset to page 1 when data changes
  const handleDataChange = useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [data.length]);

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

  const handleRequestApproval = (isAccept: boolean, requestId: string) => {
    if (isAccept) {
      acceptMutation.mutate({ id: requestId, remarks: '' });
    } else {
      declineMutation.mutate({ id: requestId, remarks: '' });
    }
  };

  const formatDateTime = (date: string, time: string) => {
    return `${date}\n${time}`;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-border shadow-md">
      <Table>
        <TableHeader className="bg-[#690003]">
          <TableRow className="border-b border-border hover:bg-[#690003]">
            <TableHead className="text-white font-semibold px-6 w-32">REQUEST DATE</TableHead>
            <TableHead className="text-white font-semibold w-40 px-6">EMPLOYEE</TableHead>
            <TableHead className="text-white font-semibold px-6 w-64">REQUESTED ITEM/S</TableHead>
            <TableHead className="text-white font-semibold text-right px-6 w-32">
              TOTAL COST
            </TableHead>
            <TableHead className="text-white font-semibold text-center px-6 w-28">ACTION</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((request) => (
            <TableRow
              key={request.id}
              className="bg-[#FBF4E8] hover:bg-[#ffffff] transition-colors border-b border-border"
            >
              <TableCell className="px-6">
                <div className="text-sm font-medium">
                  {new Date(request.requestedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(request.requestedAt).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </div>
              </TableCell>
              <TableCell className="text-sm px-6">{request.userName}</TableCell>
              <TableCell className="px-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{`${request.quantity || 1} x ${request.rewardName}`}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
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
              </TableCell>
              <TableCell className="text-sm text-right font-medium px-6">
                {request.pointsCost * (request.quantity || 1)}{' '}
                {request.pointsCost * (request.quantity || 1) === 1 ? 'Pt' : 'Pts'}
              </TableCell>
              <TableCell className="text-center px-6">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRequestApproval(false, request.id)}
                    disabled={declineMutation.isPending || acceptMutation.isPending}
                    className="p-2 h-auto text-muted-foreground hover:text-red-600 cursor-pointer hover:bg-red-50 disabled:opacity-50"
                    aria-label="Deny request"
                  >
                    <X size={20} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRequestApproval(true, request.id)}
                    disabled={declineMutation.isPending || acceptMutation.isPending}
                    className="p-2 h-auto text-muted-foreground hover:text-green-600 cursor-pointer hover:bg-green-50 disabled:opacity-50"
                    aria-label="Approve request"
                  >
                    <Check size={20} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 py-4 bg-[#FBF4E8]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="cursor-pointer"
          >
            <ChevronLeft size={16} />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            // Show first page, last page, current page, and pages around current
            const showPage =
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1);

            if (!showPage) {
              // Show ellipsis before current page range
              if (page === currentPage - 2 && currentPage > 3) {
                return (
                  <span key={`ellipsis-before`} className="px-2 text-muted-foreground">
                    …
                  </span>
                );
              }
              // Show ellipsis after current page range
              if (page === currentPage + 2 && currentPage < totalPages - 2) {
                return (
                  <span key={`ellipsis-after`} className="px-2 text-muted-foreground">
                    …
                  </span>
                );
              }
              return null;
            }

            return (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="cursor-pointer"
              >
                {page}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="cursor-pointer"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}

      {/* Empty State */}
      {data.length === 0 && (
        <div className="text-center py-12 text-muted-foreground bg-[#FBF4E8]">
          <p className="text-sm">No redemption requests found</p>
        </div>
      )}
    </div>
  );
}
