'use client';

import { X, Check, MessageSquare } from 'lucide-react';
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
    <div className="overflow-x-auto rounded-lg border border-border shadow-md">
      <Table>
        <TableHeader className="bg-[#690003]">
          <TableRow className="border-b border-border hover:bg-[#690003]">
            <TableHead className="text-white font-semibold px-4 w-[180px]">REQUEST DATE</TableHead>
            <TableHead className="text-white font-semibold px-4 w-[200px]">EMPLOYEE</TableHead>
            <TableHead className="text-white font-semibold px-4 w-[250px]">TASK</TableHead>
            <TableHead className="text-white font-semibold text-center px-4 w-[120px]">
              COMPLETED
            </TableHead>
            <TableHead className="text-white font-semibold text-center px-4 w-[140px]">
              TOTAL POINTS & XP
            </TableHead>
            <TableHead className="text-white font-semibold text-center px-4 w-[80px]">REMARK</TableHead>
            <TableHead className="text-white font-semibold text-center px-4 w-[120px]">ACTION</TableHead>
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
                className="bg-[#FBF4E8] hover:bg-[#ffffff] transition-colors border-b border-border"
              >
                <TableCell className="text-sm font-medium px-4 w-[180px]">
                  {formatDate(request.kpitask_completed_at || request.kpitask_created_at)}
                </TableCell>
                <TableCell className="px-4 w-[200px]">
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
                <TableCell className="text-sm px-4 w-[250px]">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="truncate">{taskName}</div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-xs">{taskName}</div>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="text-sm text-center px-4 w-[120px]">
                  {request.completed_orders ?? 0} / {request.max_orders ?? 0}
                </TableCell>
                <TableCell className="text-sm text-center font-medium px-4 w-[140px]">
                  {request.category_points ?? 0} Pts/XP
                </TableCell>
                <TableCell className="text-center px-4 w-[80px]">
                  {hasRemark ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#690003] hover:bg-[#fbeaea]"
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
                <TableCell className="text-center px-4 w-[120px]">
                  <div className="flex items-center justify-center gap-2">
                    {isShowingActions ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          // need to pass extra params, request.category_points, request.assigned_to, request.remark and request.kpitask_id
                          onClick={() => onDeny(request.kpitask_id)}
                          disabled={isRejecting || isApproving}
                          className="p-2 h-auto shrink-0 text-muted-foreground hover:text-red-600 cursor-pointer hover:bg-red-50 disabled:opacity-50"
                          aria-label="Deny request"
                        >
                          <X size={20} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          // need to pass extra params, request.category_points, request.assigned_to, request.remark and request.kpitask_id
                          onClick={() => onApprove(request.kpitask_id)}
                          disabled={isRejecting || isApproving}
                          className="p-2 h-auto shrink-0 text-muted-foreground hover:text-green-600 cursor-pointer hover:bg-green-50 disabled:opacity-50"
                          aria-label="Approve request"
                        >
                          <Check size={20} />
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
        <div className="text-center bg-[#FBF4E8] py-12 text-muted-foreground">
          <p className="text-sm">No requests found</p>
        </div>
      )}

      {/* Remark Modal */}
      <Dialog open={remarkModalOpen} onOpenChange={setRemarkModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#690003]">Task Remark</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-[#5a2a2a] whitespace-pre-wrap wrap-break-word">
              {selectedRemark}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
