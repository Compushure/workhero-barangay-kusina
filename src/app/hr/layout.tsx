import { protectHRRoute } from '@/actions/shared/auth';
import { Sidebar } from '@/components/hr/sidebar';
import { NavigationOverlay } from '@/components/shared/navigation-overlay';

export default async function HRLayout({ children }: { children: React.ReactNode }) {
  await protectHRRoute();
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="relative flex-1">
        <NavigationOverlay />
        <main className="relative z-0">{children}</main>
      </div>
    </div>
  );
}
