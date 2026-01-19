'use client';

import { useState } from 'react';
import { Check, X, ChevronDown } from 'lucide-react';
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

export interface RedemptionRequest {
  id: string;
  requestDate: string;
  requestTime: string;
  employee: string;
  requestedItems: string;
  cost: number;
  status: 'pending' | 'approved' | 'rejected';
}

interface RedemptionTableProps {
  data: RedemptionRequest[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function RedemptionTable({ data, onApprove, onReject }: RedemptionTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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
          {data.map((request) => (
            <TableRow
              key={request.id}
              className="bg-[#FBF4E8] hover:bg-[#ffffff] transition-colors border-b border-border"
            >
              <TableCell className="px-6">
                <div className="text-sm font-medium">{request.requestDate}</div>
                <div className="text-xs text-muted-foreground">{request.requestTime}</div>
              </TableCell>
              <TableCell className="text-sm px-6">{request.employee}</TableCell>
              <TableCell className="px-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{request.requestedItems}</span>
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
                {request.cost} Pts
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

      {/* Empty State */}
      {data.length === 0 && (
        <div className="text-center py-12 text-muted-foreground bg-[#FBF4E8]">
          <p className="text-sm">No redemption requests found</p>
        </div>
      )}
    </div>
  );
}
