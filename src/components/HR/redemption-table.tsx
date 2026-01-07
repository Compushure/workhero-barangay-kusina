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
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {/* Table Header */}
      <div className="grid grid-cols-[1.5fr_1.5fr_2fr_1fr_1fr] gap-4 border-b border-border bg-muted px-6 py-4">
        <div className="text-sm font-semibold uppercase tracking-wide text-foreground">
          Request Date
        </div>
        <div className="text-sm font-semibold uppercase tracking-wide text-foreground">
          Employee
        </div>
        <div className="text-sm font-semibold uppercase tracking-wide text-foreground">
          Requested Item/S
        </div>
        <div className="text-sm font-semibold uppercase tracking-wide text-foreground">Cost</div>
        <div className="text-sm font-semibold uppercase tracking-wide text-foreground">Action</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-border">
        {data.map((request) => (
          <div
            key={request.id}
            className="grid grid-cols-[1.5fr_1.5fr_2fr_1fr_1fr] gap-4 px-6 py-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex flex-col justify-center">
              <p className="text-sm font-medium text-foreground">{request.requestDate}</p>
              <p className="text-xs text-muted-foreground">{request.requestTime}</p>
            </div>
            <div className="flex items-center">
              <p className="text-sm text-foreground">{request.employee}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-foreground">{request.requestedItems}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
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
              <p className="text-sm font-medium text-foreground">{request.cost} Pts</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleRequestApproval(false, request.id)}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-success/10 hover:text-success"
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
