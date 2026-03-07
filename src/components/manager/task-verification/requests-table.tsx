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
    <div className="overflow-x-auto rounded-lg border border-accent/50 shadow-sm/25">
      <Table>
        <TableHeader className="">
          <TableRow className="bg-primary-gradient border-b border-accent/50">
            <TableHead className="text-card px-4 w-45">REQUEST DATE</TableHead>
            <TableHead className="text-card px-4 w-50">EMPLOYEE</TableHead>
            <TableHead className="text-card px-4 w-64">TASK</TableHead>
            <TableHead className="text-card text-center px-4 w-30">COMPLETED</TableHead>
            <TableHead className="text-card text-center px-4 w-15">POINTS</TableHead>
            <TableHead className="text-card text-center px-4 w-15">XP</TableHead>
            <TableHead className="text-card text-center px-4 w-20">REMARK</TableHead>
            <TableHead className="text-card text-center px-4 w-30">ACTION</TableHead>
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
                className="bg-background hover:bg-row-hover transition-all duration-400 ease-in-out border-b border-accent/25"
              >
                <TableCell className="text-sm font-medium px-4 w-45">
                  {formatDate(request.kpitask_completed_at || request.kpitask_created_at)}
                </TableCell>
                <TableCell className="px-4 max-w-50">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <div className="text-sm font-medium truncate">{employeeName}</div>
                        <div className="text-xs text-muted-foreground truncate">{employeeId}</div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div>
                        <div className="font-medium">{employeeName}</div>
                        <div className="text-xs">{employeeId}</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="text-sm px-4 max-w-64">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="truncate">{taskName}</div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-xs">{taskName}</div>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="text-sm text-center px-4 w-30">
                  <div className="flex items-center justify-left gap-1 font-medium">
                    <Soup strokeWidth={1.75} className="size-5 ml-5 mr-1" />
                    {request.completed_orders ?? 0} / {request.max_orders ?? 0}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-center font-medium px-4 w-15">
                  <div className="flex items-center justify-center gap-1">
                    <Coins strokeWidth={1.75} className="size-6" />
                    {request.category_points ?? 0}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-center font-medium px-4 w-15">
                  <div className="flex items-center justify-center gap-2">
                    <span className="inline-block italic text-base leading-none">XP</span>
                    {request.category_xp ?? 0}
                  </div>
                </TableCell>
                <TableCell className="text-center px-4 w-20">
                  {hasRemark ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-foreground hover:bg-accent/15"
                          onClick={() => {
                            setSelectedRemark(request.remark || '');
                            setRemarkModalOpen(true);
                          }}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View remark</TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center px-4 w-30">
                  <div className="flex items-center justify-center gap-2">
                    {isShowingActions ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          // need to pass extra params, request.category_points, request.assigned_to, request.remark and request.kpitask_id
                          onClick={() => onApprove(request.kpitask_id)}
                          disabled={isRejecting || isApproving}
                          className="p-2 h-auto shrink-0 text-muted-foreground border border-accent-secondary/50 hover:text-green-600 cursor-pointer bg-card hover:bg-green-100 disabled:opacity-50"
                          aria-label="Approve request"
                        >
                          <Check size={20} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          // need to pass extra params, request.category_points, request.assigned_to, request.remark and request.kpitask_id
                          onClick={() => onDeny(request.kpitask_id)}
                          disabled={isRejecting || isApproving}
                          className="p-2 h-auto shrink-0 text-muted-foreground border border-accent-secondary/50 hover:text-red-600 cursor-pointer bg-card hover:bg-red-100 disabled:opacity-50"
                          aria-label="Deny request"
                        >
                          <X size={20} />
                        </Button>
                      </>
                    ) : (
                      <>
                        {request.status === 'approved' && (
                          <span className="inline-flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap shrink-0">
                            Accepted
                          </span>
                        )}
                        {request.status === 'rejected' && (
                          <span className="inline-flex items-center bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap shrink-0">
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
        <div className="text-center bg-background py-12 text-secondary">
          <p className="text-sm">No requests found</p>
        </div>
      )}

      {/* Remark Modal */}
      <Dialog open={remarkModalOpen} onOpenChange={setRemarkModalOpen}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">Task Remark</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-primary whitespace-pre-wrap wrap-break-word">
              {selectedRemark}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
