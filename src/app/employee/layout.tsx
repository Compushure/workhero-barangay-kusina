import { protectEmployeeRoute } from '@/actions/auth';
import { Sidebar } from '@/components/employee/sidebar';

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  await protectEmployeeRoute();
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
