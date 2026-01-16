'use client';

import { useState } from 'react';
import { Check, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      acceptMutation.mutate(requestId);
    } else {
      declineMutation.mutate(requestId);
    }
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
        {data.map((request) => (
          <div
            key={request.id}
            className="grid grid-cols-[1.5fr_1.5fr_2fr_1fr_1fr] gap-4 px-6 py-4 transition-colors hover:bg-[#fbeaea]"
          >
            <div className="flex flex-col justify-center">
              <p className="text-sm font-medium text-[#5a2a2a]">{request.requestDate}</p>
              <p className="text-xs text-[#7a3d3d]">{request.requestTime}</p>
            </div>
            <div className="flex items-center">
              <p className="text-sm text-[#5a2a2a]">{request.employee}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-[#5a2a2a]">{request.requestedItems}</p>
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
              <p className="text-sm font-medium text-[#5a2a2a]">{request.cost} Pts</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#8b0000] hover:bg-[#8b0000] hover:text-white"
                onClick={() => handleRequestApproval(false, request.id)}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#2d5016] hover:bg-[#2d5016] hover:text-white"
                onClick={() => handleRequestApproval(true, request.id)}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
