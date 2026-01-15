import { Suspense } from 'react';
import { VerificationRequestsPage } from '@/components/Manager/Task-Verification/verification-request-page';
import type { VerificationRequest } from '@/types/manager-verification-req';
import { Sidebar } from '@/components/Manager/Task-Verification/sidebar';

// Temporary mock data (replace with Supabase query later)
const MOCK_REQUESTS: VerificationRequest[] = [
  {
    id: '1',
    date: new Date('2025-10-25T10:30:00'),
    employeeName: 'Carlos Mendoza',
    employeeId: 'E001',
    task: 'Project Documentation',
    repeat: 1,
    totalPoints: 5,
    status: 'pending',
  },
  {
    id: '2',
    date: new Date('2025-10-25T11:00:00'),
    employeeName: 'Angela Reyes',
    employeeId: 'E002',
    task: 'Client Presentation',
    repeat: 2,
    totalPoints: 10,
    status: 'pending',
  },
  {
    id: '3',
    date: new Date('2025-10-25T13:15:00'),
    employeeName: 'Mark Villanueva',
    employeeId: 'E003',
    task: 'System Testing',
    repeat: 3,
    totalPoints: 15,
    status: 'pending',
  },
  {
    id: '4',
    date: new Date('2025-10-25T14:45:00'),
    employeeName: 'Sophia Cruz',
    employeeId: 'E004',
    task: 'Knowledge Sharing Session',
    repeat: 1,
    totalPoints: 8,
    status: 'pending',
  },
  {
    id: '5',
    date: new Date('2025-10-25T15:30:00'),
    employeeName: 'Daniel Santos',
    employeeId: 'E005',
    task: 'Customer Support Ticket',
    repeat: 4,
    totalPoints: 12,
    status: 'pending',
  },
  {
    id: '6',
    date: new Date('2025-10-25T16:00:00'),
    employeeName: 'Emily Tan',
    employeeId: 'E006',
    task: 'Process Improvement Proposal',
    repeat: 2,
    totalPoints: 9,
    status: 'pending',
  },
  {
    id: '7',
    date: new Date('2025-10-24T10:30:00'),
    employeeName: 'Miguel Ramos',
    employeeId: 'E007',
    task: 'Team Workshop Facilitation',
    repeat: 1,
    totalPoints: 7,
    status: 'approved',
  },
  {
    id: '8',
    date: new Date('2025-10-24T09:15:00'),
    employeeName: 'Hannah Lee',
    employeeId: 'E008',
    task: 'Data Entry Audit',
    repeat: 2,
    totalPoints: 6,
    status: 'denied',
  },
  {
    id: '9',
    date: new Date('2025-10-23T14:00:00'),
    employeeName: 'Robert Cruz',
    employeeId: 'E009',
    task: 'Weekly Report Submission',
    repeat: 1,
    totalPoints: 5,
    status: 'approved',
  },
  {
    id: '10',
    date: new Date('2025-10-23T15:30:00'),
    employeeName: 'Isabella Flores',
    employeeId: 'E010',
    task: 'Client Survey Analysis',
    repeat: 1,
    totalPoints: 10,
    status: 'pending',
  },
  {
    id: '11',
    date: new Date('2025-10-22T09:45:00'),
    employeeName: 'Joshua Lim',
    employeeId: 'E011',
    task: 'Bug Fix Deployment',
    repeat: 2,
    totalPoints: 12,
    status: 'approved',
  },
  {
    id: '12',
    date: new Date('2025-10-22T11:20:00'),
    employeeName: 'Patricia Gomez',
    employeeId: 'E012',
    task: 'Training Material Preparation',
    repeat: 1,
    totalPoints: 8,
    status: 'denied',
  },
  {
    id: '13',
    date: new Date('2025-10-21T13:00:00'),
    employeeName: 'Kevin Torres',
    employeeId: 'E013',
    task: 'Meeting Facilitation',
    repeat: 1,
    totalPoints: 6,
    status: 'pending',
  },
  {
    id: '14',
    date: new Date('2025-10-21T14:30:00'),
    employeeName: 'Andrea Morales',
    employeeId: 'E014',
    task: 'Knowledge Base Update',
    repeat: 2,
    totalPoints: 9,
    status: 'approved',
  },
  {
    id: '15',
    date: new Date('2025-10-20T10:00:00'),
    employeeName: 'Victor Hernandez',
    employeeId: 'E015',
    task: 'Performance Review Draft',
    repeat: 1,
    totalPoints: 7,
    status: 'pending',
  },
]

export default async function Manager() {
  // Later: const requests = await supabase.from('verification_requests').select('*');
  const requests = MOCK_REQUESTS;

  return (
    <Suspense>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <VerificationRequestsPage initialRequests={requests} />
        </main>
      </div>
    </Suspense>
  );
}
