import { protectHRRoute } from '@/actions/auth';
import { Sidebar } from '@/components/hr/sidebar';

export default async function HRLayout({ children }: { children: React.ReactNode }) {
  await protectHRRoute();
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
