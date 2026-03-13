'use client';

import { X, Check, MessageSquare, Coins, Soup } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { VerificationRequest, SortOption } from '@/types';

interface RequestsTableProps {
  requests: VerificationRequest[];
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
  sortBy: SortOption;
  isApproving?: boolean;
  isRejecting?: boolean;
}

export function RequestsTable({
  requests,
  onApprove,
  onDeny,
  sortBy,
  isApproving = false,
  isRejecting = false,
}: RequestsTableProps) {
  const [remarkModalOpen, setRemarkModalOpen] = useState(false);
  const [selectedRemark, setSelectedRemark] = useState<string>('');
  const formatDate = (date: Date | null | string) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    return dateObj.toLocaleDateString('en-US', options);
  };

  const isShowingActions = sortBy === 'pending';

  return (
    <div className="overflow-x-auto rounded-lg shadow-sm/25 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <Table>
        <TableHeader className="bg-primary-gradient">
          <TableRow className="bg-primary-gradient">
            <TableHead className="hidden sm:table-cell text-card px-2 sm:px-3 w-24 sm:w-40 text-[11px] sm:text-xs">
              REQUEST DATE
            </TableHead>
            <TableHead className="text-card px-2 sm:px-3 w-28 sm:w-44 text-[11px] sm:text-xs">
              EMPLOYEE
            </TableHead>
            <TableHead className="text-card px-2 sm:px-3 w-32 sm:w-56 text-[11px] sm:text-xs">
              TASK
            </TableHead>
            <TableHead className="text-card text-center px-2 sm:px-3 w-20 sm:w-28 text-[10px] sm:text-xs hidden xl:table-cell">
              COMPLETED
            </TableHead>
            <TableHead className="text-card text-center px-2 sm:px-3 w-14 sm:w-14 text-[10px] sm:text-xs hidden xl:table-cell">
              POINTS
            </TableHead>
            <TableHead className="text-card text-center px-2 sm:px-3 w-14 sm:w-14 text-[10px] sm:text-xs hidden xl:table-cell">
              XP
            </TableHead>
            <TableHead className="hidden lg:table-cell text-card text-center px-2 sm:px-3 w-12 sm:w-16 text-[10px] sm:text-xs">
              REMARK
            </TableHead>
            <TableHead className="text-card text-center px-2 sm:px-3 w-24 sm:w-28 text-[10px] sm:text-xs right-0">
              ACTION
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => {
            const employeeName = request.assigned_to_name || 'N/A';
            const employeeId = request.assigned_to_employee_id || 'N/A';
            const taskName = request.category_name || 'N/A';
            const hasRemark = request.remark && request.remark.trim() !== '';

            return (
              <TableRow
                key={request.kpitask_id}
                className="bg-card hover:bg-row-hover transition-all duration-400 ease-in-out"
              >
                <TableCell className="hidden sm:table-cell text-[10px] sm:text-xs font-medium px-2 sm:px-3 py-6 w-24 sm:w-40">
                  {formatDate(request.kpitask_completed_at || request.kpitask_created_at)}
                </TableCell>
                <TableCell className="px-2 sm:px-3 py-2 max-w-28 sm:max-w-44">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <div className="text-xs sm:text-sm font-medium truncate">
                          {employeeName}
                        </div>
                        <div className="text-[11px] sm:text-xs text-muted-foreground truncate">
                          {employeeId}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div>
                        <div className="font-medium text-xs">{employeeName}</div>
                        <div className="text-[10px]">{employeeId}</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="text-xs sm:text-sm px-2 sm:px-3 py-2 max-w-32 sm:max-w-56">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="font-medium truncate">{taskName}</div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-xs text-sm">{taskName}</div>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="text-[10px] sm:text-xs text-center px-2 sm:px-3 py-2 w-20 sm:w-28 hidden xl:table-cell">
                  <div className="flex items-center justify-left gap-1 font-medium">
                    <Soup strokeWidth={1.75} className="size-3 sm:size-4 ml-1 sm:ml-9 mr-0.5" />
                    {request.completed_orders ?? 0} / {request.max_orders ?? 0}
                  </div>
                </TableCell>
                <TableCell className="text-[10px] sm:text-xs text-center font-medium px-2 sm:px-3 py-2 w-14 sm:w-14 hidden xl:table-cell">
                  <div className="flex items-center justify-center gap-0.5">
                    <Coins strokeWidth={1.75} className="size-3 sm:size-4" />
                    {request.category_points ?? 0}
                  </div>
                </TableCell>
                <TableCell className="text-[10px] sm:text-xs text-center font-medium px-2 sm:px-3 py-2 w-14 sm:w-14 hidden xl:table-cell">
                  <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                    <span className="inline-block italic text-[10px] sm:text-xs leading-none">
                      XP
                    </span>
                    {request.category_xp ?? 0}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-center px-1 sm:px-3 py-2 w-12 sm:w-16">
                  {hasRemark ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 sm:h-7 sm:w-7 text-foreground hover:bg-accent/15"
                          onClick={() => {
                            setSelectedRemark(request.remark || '');
                            setRemarkModalOpen(true);
                          }}
                        >
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View remark</TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center px-2 sm:px-3 py-2 w-24 sm:w-28 right-0">
                  <div className="flex items-center justify-center gap-1">
                    {isShowingActions ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onApprove(request.kpitask_id)}
                          disabled={isRejecting || isApproving}
                          className="p-1 sm:p-1.5 h-auto shrink-0 text-muted-foreground border border-accent-secondary/50 hover:text-green-600 cursor-pointer bg-card hover:bg-green-100 disabled:opacity-50"
                          aria-label="Approve request"
                        >
                          <Check size={14} className="sm:size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeny(request.kpitask_id)}
                          disabled={isRejecting || isApproving}
                          className="p-1 sm:p-1.5 h-auto shrink-0 text-muted-foreground border border-accent-secondary/50 hover:text-red-600 cursor-pointer bg-card hover:bg-red-100 disabled:opacity-50"
                          aria-label="Deny request"
                        >
                          <X size={14} className="sm:size-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        {request.status === 'approved' && (
                          <span className="inline-flex items-center bg-green-100 text-green-700 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-medium whitespace-nowrap shrink-0">
                            Accepted
                          </span>
                        )}
                        {request.status === 'rejected' && (
                          <span className="inline-flex items-center bg-red-100 text-red-700 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-medium whitespace-nowrap shrink-0">
                            Denied
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Empty State */}
      {requests.length === 0 && (
        <div className="text-center bg-card py-8 text-secondary">
          <p className="text-xs">No requests found</p>
        </div>
      )}

      {/* Remark Modal */}
      <Dialog open={remarkModalOpen} onOpenChange={setRemarkModalOpen}>
        <DialogContent className="w-[min(92vw,350px)] sm:w-[min(85vw,450px)] md:w-[min(75vw,550px)] lg:w-[min(65vw,650px)] rounded-2xl p-3 sm:p-4 md:p-5 bg-card">
          <DialogHeader>
            <DialogTitle className="text-sm sm:text-base font-bold text-foreground">
              Task Remark
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 sm:py-3">
            <p className="text-[10px] sm:text-xs text-primary whitespace-pre-wrap wrap-break-word leading-relaxed">
              {selectedRemark}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
