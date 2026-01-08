'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/Manager/Task-Verification/page-header';
import { SearchBar } from '@/components/Manager/Task-Verification/search-bar';
import { SortButton } from '@/components/Manager/Task-Verification/sort-button';
import { RequestsTable } from '@/components/Manager/Task-Verification/requests-table';
import type { VerificationRequest, SortOption } from '@/types/manager-verification-req';

// Mock data - will be replaced with Supabase queries
const MOCK_REQUESTS: VerificationRequest[] = [
  {
    id: '1',
    date: new Date('2025-10-25T10:30:00'),
    employeeName: 'Juan Dela Cruz',
    employeeId: 'EMP001',
    task: 'Tenure Service',
    repeat: 1,
    totalPoints: 5,
    status: 'pending',
  },
  {
    id: '2',
    date: new Date('2025-10-25T10:30:00'),
    employeeName: 'Juan Dela Cruz',
    employeeId: 'EMP001',
    task: 'Innovation Suggestion',
    repeat: 5,
    totalPoints: 10,
    status: 'pending',
  },
  {
    id: '3',
    date: new Date('2025-10-25T10:30:00'),
    employeeName: 'Juan Dela Cruz',
    employeeId: 'EMP001',
    task: 'Internal Training',
    repeat: 5,
    totalPoints: 20,
    status: 'pending',
  },
  {
    id: '4',
    date: new Date('2025-10-25T10:30:00'),
    employeeName: 'Juan Dela Cruz',
    employeeId: 'EMP001',
    task: 'Zero Undertime',
    repeat: 2,
    totalPoints: 25,
    status: 'pending',
  },
  {
    id: '5',
    date: new Date('2025-10-25T10:30:00'),
    employeeName: 'Juan Dela Cruz',
    employeeId: 'EMP001',
    task: 'Client Feedback Form',
    repeat: 2,
    totalPoints: 4,
    status: 'pending',
  },
  {
    id: '6',
    date: new Date('2025-10-25T10:30:00'),
    employeeName: 'Juan Dela Cruz',
    employeeId: 'EMP001',
    task: 'Tenure Service',
    repeat: 3,
    totalPoints: 9,
    status: 'pending',
  },
  {
    id: '7',
    date: new Date('2025-10-24T10:30:00'),
    employeeName: 'Maria Santos',
    employeeId: 'EMP002',
    task: 'Innovation Suggestion',
    repeat: 2,
    totalPoints: 8,
    status: 'approved',
  },
  {
    id: '8',
    date: new Date('2025-10-24T09:15:00'),
    employeeName: 'Pedro Garcia',
    employeeId: 'EMP003',
    task: 'Internal Training',
    repeat: 1,
    totalPoints: 15,
    status: 'denied',
  },
];

export function VerificationRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('pending');
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [deniedIds, setDeniedIds] = useState<Set<string>>(new Set());

  const filteredAndSortedRequests = useMemo(() => {
    let result = [...MOCK_REQUESTS];

    // Apply search filter
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (req) =>
          req.employeeName.toLowerCase().includes(lowerSearch) ||
          req.employeeId.toLowerCase().includes(lowerSearch)
      );
    }

    // Apply status filter based on sort option
    result = result.filter((req) => {
      if (approvedIds.has(req.id)) return sortBy === 'approved';
      if (deniedIds.has(req.id)) return sortBy === 'denied';
      return sortBy === 'pending';
    });

    // Sort by date (newest first)
    result.sort((a, b) => b.date.getTime() - a.date.getTime());

    return result;
  }, [searchTerm, sortBy, approvedIds, deniedIds]);

  const handleApprove = (id: string) => {
    setApprovedIds((prev) => new Set([...prev, id]));
    setDeniedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleDeny = (id: string) => {
    setDeniedIds((prev) => new Set([...prev, id]));
    setApprovedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <PageHeader />
      <div className="mt-6 p-6">
        <div className="flex items-center justify-end gap-4 mb-6">
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          <SortButton sortBy={sortBy} onSortChange={setSortBy} />
        </div>
        <RequestsTable
          requests={filteredAndSortedRequests}
          onApprove={handleApprove}
          onDeny={handleDeny}
          approvedIds={approvedIds}
          deniedIds={deniedIds}
          sortBy={sortBy}
        />
      </div>
    </div>
  );
}
