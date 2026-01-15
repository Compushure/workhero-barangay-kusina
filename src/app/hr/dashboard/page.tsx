'use client';

import { useState } from 'react';
import { HeaderSection } from '@/components/hr/dashboard/header';
import {
  RedemptionTable,
  type RedemptionRequest,
} from '@/components/hr/dashboard/redemption-table';
import { useToast } from '@/hooks/use-toast';

// Mock data for now
const mockRedemptionRequests: RedemptionRequest[] = [
  {
    id: '1',
    requestDate: 'Oct 24, 2025',
    requestTime: '10:30 AM',
    employee: 'Juan Dela Cruz',
    requestedItems: '1 x Rice Sack(10kg)...',
    cost: 430,
    status: 'pending',
  },
  {
    id: '2',
    requestDate: 'Oct 23, 2025',
    requestTime: '02:15 PM',
    employee: 'Maria Santos',
    requestedItems: '2 x Cooking Oil (1L)...',
    cost: 320,
    status: 'pending',
  },
  {
    id: '3',
    requestDate: 'Oct 23, 2025',
    requestTime: '09:45 AM',
    employee: 'Pedro Reyes',
    requestedItems: '1 x Sugar (2kg), 1 x Salt (1kg)...',
    cost: 180,
    status: 'pending',
  },
];

export default function HRDashboard() {
  const [requests, setRequests] = useState<RedemptionRequest[]>(mockRedemptionRequests);
  const [filteredRequests, setFilteredRequests] =
    useState<RedemptionRequest[]>(mockRedemptionRequests);
  const { toast } = useToast();

  const handleSearch = (value: string) => {
    const filtered = requests.filter(
      (req) =>
        req.employee.toLowerCase().includes(value.toLowerCase()) ||
        req.requestedItems.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredRequests(filtered);
  };

  const handleSort = (value: string) => {
    const sorted = [...filteredRequests].sort((a, b) => {
      switch (value) {
        case 'date-desc':
          return new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime();
        case 'date-asc':
          return new Date(a.requestDate).getTime() - new Date(b.requestDate).getTime();
        case 'cost-desc':
          return b.cost - a.cost;
        case 'cost-asc':
          return a.cost - b.cost;
        case 'employee':
          return a.employee.localeCompare(b.employee);
        default:
          return 0;
      }
    });
    setFilteredRequests(sorted);
  };

  const handleApprove = (id: string) => {
    const request = requests.find((req) => req.id === id);
    toast({
      title: 'Request Approved',
      description: `${request?.employee}'s redemption request has been approved.`,
    });
    // Database part would go here
    setRequests(requests.filter((req) => req.id !== id));
    setFilteredRequests(filteredRequests.filter((req) => req.id !== id));
  };

  const handleReject = (id: string) => {
    const request = requests.find((req) => req.id === id);
    toast({
      title: 'Request Rejected',
      description: `${request?.employee}'s redemption request has been rejected.`,
      variant: 'destructive',
    });
    //Database part would go here
    setRequests(requests.filter((req) => req.id !== id));
    setFilteredRequests(filteredRequests.filter((req) => req.id !== id));
  };

  return (
    <div className="p-8 min-h-screen">
      <div className="mx-auto max-w-7xl space-y-8">
        <HeaderSection
          title="Redemption Requests"
          description="Manage employee's request of redemption"
          onSearch={handleSearch}
          onSort={handleSort}
        />
        <RedemptionTable
          data={filteredRequests}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </div>
  );
}
