import { protectEmployeeRoute } from '@/actions/shared/auth';
import { Sidebar } from '@/components/employee/sidebar';
import { LogOutBtn } from '@/components/sidebar/logout-btn';


export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await protectEmployeeRoute();
  return (
    <div className="flex min-h-screen">
      <main className="flex-1">{children}</main>
      <div className="fixed bottom-4 left-4 z-50 w-40 rounded-full shadow-md">
        <LogOutBtn />
      </div>
    </div>
  );
}