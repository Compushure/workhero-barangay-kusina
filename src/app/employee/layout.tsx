import { protectEmployeeRoute } from '@/actions/shared/auth';
import { ConditionalLogout } from '@/components/employee/conditional-logout';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await protectEmployeeRoute();
  return (
    <div className="flex min-h-screen">
      <main className="flex-1">{children}</main>
      <div className="fixed bottom-4 left-4 z-50">
        <ConditionalLogout hideOnMercado />
      </div>
    </div>
  );
}
