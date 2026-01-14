import { Suspense } from 'react';
import { VerificationRequestsPage } from '@/components/Manager/Task-Verification/verification-request-page';
import type { VerificationRequest } from '@/types/manager-verification-req';
import { Sidebar } from '@/components/Manager/Task-Verification/sidebar';

// Temporary mock data (replace with Supabase query later)
const MOCK_REQUESTS: VerificationRequest[] = [
  {
    id: '1',
    date: new Date('2025-10-25T10:30:00'),
    employeeName: 'Juan Dela Cruz',
    employeeId: '001',
    task: 'Tenure Service',
    repeat: 1,
    totalPoints: 5,
    status: 'pending',
  },
  {
    id: '2',
    date: new Date('2025-10-25T10:30:00'),
    employeeName: 'Juan Dela Cruz',
    employeeId: '001',
    task: 'Innovation Suggestion',
    repeat: 5,
    totalPoints: 10,
    status: 'pending',
  },
  {
    id: '3',
    date: new Date('2025-10-25T10:30:00'),
    employeeName: 'Juan Dela Cruz',
    employeeId: '001',
    task: 'Internal Training',
    repeat: 5,
    totalPoints: 20,
    status: 'pending',
  },
  {
    id: '4',
    date: new Date('2025-10-25T10:30:00'),
    employeeName: 'Juan Dela Cruz',
    employeeId: '001',
    task: 'Zero Undertime',
    repeat: 2,
    totalPoints: 25,
    status: 'pending',
  },
  {
    id: '5',
    date: new Date('2025-10-25T10:30:00'),
    employeeName: 'Juan Dela Cruz',
    employeeId: '001',
    task: 'Client Feedback Form',
    repeat: 2,
    totalPoints: 4,
    status: 'pending',
  },
  {
    id: '6',
    date: new Date('2025-10-25T10:30:00'),
    employeeName: 'Juan Dela Cruz',
    employeeId: '001',
    task: 'Tenure Service',
    repeat: 3,
    totalPoints: 9,
    status: 'pending',
  },
  {
    id: '7',
    date: new Date('2025-10-24T10:30:00'),
    employeeName: 'Maria Santos',
    employeeId: '002',
    task: 'Innovation Suggestion',
    repeat: 2,
    totalPoints: 8,
    status: 'approved',
  },
  {
    id: '8',
    date: new Date('2025-10-24T09:15:00'),
    employeeName: 'Pedro Garcia',
    employeeId: '003',
    task: 'Internal Training',
    repeat: 1,
    totalPoints: 15,
    status: 'denied',
  },
];

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
