import { protectEmployeeRoute } from '@/actions/shared/auth';
import { RealtimeNotificationToastClientWrapper } from '@/components/notifications/realtime-notification-toast-client-wrapper';
import { ConditionalLogout } from '@/components/employee/conditional-logout';
import { ConditionalNotifications } from '@/components/employee/conditional-notifications';
import { ConditionalMapLauncher } from '@/components/employee/conditional-map-launcher';
import { NavLoadingState } from '@/components/employee/nav-loading-state';
import { ToastViewSync } from '@/components/ui/sonner';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await protectEmployeeRoute();
  return (
    <div className="flex min-h-screen">
      <ToastViewSync view="employee" />
      <NavLoadingState />
      {/* <div className="fixed right-4 top-4 z-50">
        <ConditionalNotifications hideOnMercado />
      </div> */}
      <ConditionalMapLauncher hideOnMercado />
      <main className="flex-1">{children}</main>
      <div className="fixed bottom-4 left-4 z-50">
        <ConditionalLogout hideOnMercado />
      </div>
      <RealtimeNotificationToastClientWrapper />
    </div>
  );
}
