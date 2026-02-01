'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useGetMyRedemptionRequests } from '@/hooks/tanstack/queries/redemptionQueries';
import { RedemptionRequest } from '@/types';
import { formatNumber } from '@/lib/format';
import { format } from 'date-fns';

const REMARKS_TRUNCATE_LENGTH = 120;

interface MyRequestsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MyRequestsModal({ open, onOpenChange }: MyRequestsModalProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [expandedRemarks, setExpandedRemarks] = useState<Set<string>>(new Set());

  const toggleRemarks = (requestId: string) => {
    setExpandedRemarks((prev) => {
      const next = new Set(prev);
      if (next.has(requestId)) next.delete(requestId);
      else next.add(requestId);
      return next;
    });
  };

  // Fetch all requests (we'll filter client-side)
  const { data: allRequests = [], isLoading } = useGetMyRedemptionRequests();

  // Filter requests by status
  const pendingRequests = allRequests.filter((req) => req.status === 'pending');
  const approvedRequests = allRequests.filter((req) => req.status === 'approved');
  const rejectedRequests = allRequests.filter((req) => req.status === 'rejected');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-500 text-white flex items-center gap-1 shrink-0">
            <Clock className="h-3 w-3" />
            <span className="hidden sm:inline">Pending</span>
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-600 text-white flex items-center gap-1 shrink-0">
            <CheckCircle2 className="h-3 w-3" />
            <span className="hidden sm:inline">Approved</span>
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-600 text-white flex items-center gap-1 shrink-0">
            <XCircle className="h-3 w-3" />
            <span className="hidden sm:inline">Rejected</span>
          </Badge>
        );
      default:
        return null;
    }
  };

  const renderRequestsTable = (requests: RedemptionRequest[]) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-[#690003]" />
            <p className="text-[#5a2a2a]">Loading requests...</p>
          </div>
        </div>
      );
    }

    if (requests.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No requests found</p>
          <p className="text-sm text-gray-400 mt-1">
            {activeTab === 'pending' && 'You have no pending redemption requests'}
            {activeTab === 'approved' && 'You have no approved redemption requests'}
            {activeTab === 'rejected' && 'You have no rejected redemption requests'}
            {activeTab === 'all' && 'You have not made any redemption requests yet'}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3 min-w-0">
        {requests.map((request) => (
          <div
            key={request.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-[#690003] hover:shadow-md transition-all bg-white min-w-0"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-gray-900 truncate">
                  {request.rewardName}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(request.requestedAt), 'MMM dd, yyyy • h:mm a')}
                </p>
              </div>
              {getStatusBadge(request.status)}
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <span className="text-gray-500">Quantity:</span>
                <span className="ml-2 font-medium text-gray-900">{request.quantity}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-500">Points:</span>
                <span className="ml-2 font-semibold text-[#690003]">
                  {formatNumber(request.pointsCost * request.quantity)} pts
                </span>
              </div>
            </div>

            {request.remarks && (
              <div className="mt-3 pt-3 border-t border-gray-100 min-w-0">
                <p className="text-xs text-gray-500 italic wrap-anywhere">
                  <span className="font-medium">HR Note:</span>{' '}
                  {request.remarks.length > REMARKS_TRUNCATE_LENGTH
                    ? expandedRemarks.has(request.id)
                      ? request.remarks
                      : `${request.remarks.slice(0, REMARKS_TRUNCATE_LENGTH)}...`
                    : request.remarks}
                </p>
                {request.remarks.length > REMARKS_TRUNCATE_LENGTH && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1.5 h-auto p-0 text-xs text-[#690003] hover:bg-transparent hover:text-[#8a0004] -ml-1"
                    onClick={() => toggleRemarks(request.id)}
                  >
                    {expandedRemarks.has(request.id) ? (
                      <>
                        Show less <ChevronUp className="h-3.5 w-3.5" />
                      </>
                    ) : (
                      <>
                        Show more <ChevronDown className="h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-6xl xl:max-w-7xl 2xl:max-w-[85rem] max-h-[60vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-[#690003]">My Requests</DialogTitle>
          <DialogDescription className="text-[#7a3d3d]">
            View your redemption request history and status
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 sticky top-0 bg-white z-10">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-[#690003] data-[state=active]:text-white text-xs sm:text-sm"
              >
                All ({allRequests.length})
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white text-xs sm:text-sm"
              >
                Pending ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-xs sm:text-sm"
              >
                Approved ({approvedRequests.length})
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs sm:text-sm"
              >
                Rejected ({rejectedRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              {renderRequestsTable(allRequests)}
            </TabsContent>

            <TabsContent value="pending" className="mt-0">
              {renderRequestsTable(pendingRequests)}
            </TabsContent>

            <TabsContent value="approved" className="mt-0">
              {renderRequestsTable(approvedRequests)}
            </TabsContent>

            <TabsContent value="rejected" className="mt-0">
              {renderRequestsTable(rejectedRequests)}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
