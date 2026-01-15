'use client';

import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { VerificationRequest, SortOption } from '@/types/manager-verification-req';

interface RequestsTableProps {
  requests: VerificationRequest[];
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
  statuses: Map<string, 'approved' | 'denied'>;
  sortBy: SortOption;
}

export function RequestsTable({
  requests,
  onApprove,
  onDeny,
  statuses,
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
    <div className="overflow-x-auto rounded-lg border border-border shadow-md">
      <Table>
        <TableHeader className="bg-[#690003]">
          <TableRow className="border-b border-border hover:bg-[#690003]">
            <TableHead className="text-white font-semibold px-12 w-32">REQUEST DATE</TableHead>
            <TableHead className="text-white font-semibold w-40 px-2">EMPLOYEE</TableHead>
            <TableHead className="text-white font-semibold px-10 w-56">TASK</TableHead>
            <TableHead className="text-white font-semibold text-center pl-10 pr-25 w-10">
              REPEAT
            </TableHead>
            <TableHead className="text-white font-semibold text-center pr-20 w-24">
              TOTAL/INSTANCE
            </TableHead>
            <TableHead className="text-white font-semibold text-center px-2 w-28">ACTION</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => {
            const status = statuses.get(request.id);
            return (
              <TableRow
                key={request.id}
                className="bg-[#FBF4E8] hover:bg-[#ffffff] transition-colors border-b border-border"
              >
                <TableCell className="text-sm font-medium pl-6 pr-12">
                  {formatDate(request.date)}
                </TableCell>
                <TableCell className="px-2">
                  <div className="text-sm font-medium">{request.employeeName}</div>
                  <div className="text-xs text-muted-foreground">{request.employeeId}</div>
                </TableCell>
                <TableCell className="text-sm px-4">{request.task}</TableCell>
                <TableCell className="text-sm text-center pl-10 pr-25">{request.repeat}</TableCell>
                <TableCell className="text-sm text-center font-medium pr-25">
                  {request.totalPoints} Pts
                </TableCell>
                <TableCell className="text-center px-2">
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
                        {status === 'approved' && (
                          <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                            Accepted
                          </span>
                        )}
                        {status === 'denied' && (
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
