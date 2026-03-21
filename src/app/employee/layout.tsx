import { protectEmployeeRoute } from '@/actions/shared/auth';
import { RealtimeNotificationToastClientWrapper } from '@/components/notifications/realtime-notification-toast-client-wrapper';
import { ConditionalMapLauncher } from '@/components/employee/conditional-map-launcher';
import { NavLoadingState } from '@/components/employee/nav-loading-state';
import { ToastViewSync } from '@/components/ui/sonner';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await protectEmployeeRoute();
  return (
    <div className="flex min-h-screen">
      <ToastViewSync view="employee" />
      <NavLoadingState />
      <ConditionalMapLauncher hideOnMercado />
      <main className="flex-1">{children}</main>
      <RealtimeNotificationToastClientWrapper />
    </div>
  );
}
