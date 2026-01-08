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
import type { VerificationRequest, SortOption } from '@/types/manager-verification-req';

interface RequestsTableProps {
  requests: VerificationRequest[];
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
  approvedIds: Set<string>;
  deniedIds: Set<string>;
  sortBy: SortOption;
}

export function RequestsTable({
  requests,
  onApprove,
  onDeny,
  approvedIds,
  deniedIds,
  sortBy,
}: RequestsTableProps) {
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    return date.toLocaleDateString('en-US', options);
  };

  const isShowingActions = sortBy === 'pending';

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader className="bg-[#690003]">
          <TableRow className="border-b border-border hover:bg-[#690003">
            <TableHead className="text-white font-semibold px-15">REQUEST DATE</TableHead>
            <TableHead className="text-white font-semibold px-10">EMPLOYEE</TableHead>
            <TableHead className="text-white font-semibold px-30">TASK</TableHead>
            <TableHead className="text-white font-semibold text-center px-6">REPEAT</TableHead>
            <TableHead className="text-white font-semibold text-center min-w-80 px-6">
              TOTAL POINTS
            </TableHead>
            <TableHead className="text-white font-semibold text-center w-auto px-6">
              ACTION
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow
              key={request.id}
              className="bg-[#FBF4E8] hover:bg-[#ffefd8] transition-colors border-b border-border"
            >
              <TableCell className="text-sm font-medium px-10">
                {formatDate(request.date)}
              </TableCell>
              <TableCell className="px-6">
                <div className="text-sm font-medium">{request.employeeName}</div>
                <div className="text-xs text-muted-foreground">{request.employeeId}</div>
              </TableCell>
              <TableCell className="text-sm px-20">{request.task}</TableCell>
              <TableCell className="text-sm text-center px-6">{request.repeat}</TableCell>
              <TableCell className="text-sm text-center font-medium px-6">
                {request.totalPoints} Pts
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  {isShowingActions ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeny(request.id)}
                        className="p-2 h-auto text-muted-foreground hover:text-red-600 cursor-pointer hover:bg-red-50"
                        aria-label="Deny request"
                      >
                        <X size={20} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onApprove(request.id)}
                        className="p-2 h-auto text-muted-foreground hover:text-green-600 cursor-pointer hover:bg-green-50"
                        aria-label="Approve request"
                      >
                        <Check size={20} />
                      </Button>
                    </>
                  ) : (
                    <>
                      {approvedIds.has(request.id) && (
                        <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                          Accepted
                        </span>
                      )}
                      {deniedIds.has(request.id) && (
                        <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                          Denied
                        </span>
                      )}
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
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
