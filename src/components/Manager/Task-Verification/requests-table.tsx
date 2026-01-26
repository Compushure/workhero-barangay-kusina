'use client';

import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
            <TableHead className="text-white font-semibold px-6 w-32">REQUEST DATE</TableHead>
            <TableHead className="text-white font-semibold w-40 px-6">EMPLOYEE</TableHead>
            <TableHead className="text-white font-semibold px-10 pl-15 w-56">TASK</TableHead>
            <TableHead className="text-white font-semibold text-center pl-10 pr-25 w-10">
              COMPLETED
            </TableHead>
            <TableHead className="text-white font-semibold text-center pr-18 w-24">
              TOTAL POINTS & XP
            </TableHead>
            <TableHead className="text-white font-semibold text-center px-2 w-28">ACTION</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => {
            return (
              <TableRow
                key={request.kpitask_id}
                className="bg-[#FBF4E8] hover:bg-[#ffffff] transition-colors border-b border-border"
              >
                <TableCell className="text-sm font-medium pl-6 pr-12">
                  {formatDate(request.kpitask_completed_at || request.kpitask_created_at)}
                </TableCell>
                <TableCell className="px-6">
                  <div className="text-sm font-medium">{request.assigned_to_name || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground">
                    {request.assigned_to_employee_id || 'N/A'}
                  </div>
                </TableCell>
                <TableCell className="text-sm px-4 pl-15">
                  {request.category_name || 'N/A'}
                </TableCell>
                <TableCell className="text-sm text-center pl-10 pr-25">
                  {request.completed_orders ?? 0 }/ {request.max_orders ?? 0}
                </TableCell>
                <TableCell className="text-sm text-center font-medium pr-25">
                  {request.category_points ?? 0} Pts/XP
                </TableCell>
                <TableCell className="text-center px-2">
                  <div className="flex items-center justify-center gap-2">
                    {isShowingActions ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          // need to pass extra params, request.category_points, request.assigned_to, request.remark and request.kpitask_id
                          onClick={() => onDeny(request.kpitask_id)}
                          disabled={isRejecting || isApproving}
                          className="p-2 h-auto text-muted-foreground hover:text-red-600 cursor-pointer hover:bg-red-50 disabled:opacity-50"
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
                          className="p-2 h-auto text-muted-foreground hover:text-green-600 cursor-pointer hover:bg-green-50 disabled:opacity-50"
                          aria-label="Approve request"
                        >
                          <Check size={20} />
                        </Button>
                      </>
                    ) : (
                      <>
                        {request.status === 'approved' && (
                          <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                            Accepted
                          </span>
                        )}
                        {request.status === 'rejected' && (
                          <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
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
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No requests found</p>
        </div>
      )}
    </div>
  );
}
