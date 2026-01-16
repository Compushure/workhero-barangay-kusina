import { TaskAssignmentPage } from '@/components/manager/task-assignment/task-assignment-page';
import { Sidebar } from '@/components/Manager/Task-Verification/sidebar';
// import { VerificationRequestsPage } from '@/components/Manager/Task-Verification/verification-request-page';

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {/* <VerificationRequestsPage /> */}
        <TaskAssignmentPage />
      </main>
    </div>
  );
}
