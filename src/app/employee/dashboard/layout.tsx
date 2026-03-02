import { protectEmployeeRoute } from '@/actions/shared/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await protectEmployeeRoute();
  return (
    <div className="flex min-h-screen">
      <main className="flex-1">{children}</main>
    </div>
  );
}
