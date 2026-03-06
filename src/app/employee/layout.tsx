import { protectEmployeeRoute } from '@/actions/shared/auth';
import { LogOutBtn } from '@/components/employee/attendance/logout';
import { NotificationsPopover } from '@/components/notifications/notifications';
import { RealtimeNotificationToastClientWrapper } from '@/components/notifications/realtime-notification-toast-client-wrapper';
import { ConditionalLogout } from '@/components/employee/conditional-logout';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await protectEmployeeRoute();
  return (
    <div className="flex min-h-screen">
      <div className="fixed right-4 top-4 z-50">
        <NotificationsPopover />
      </div>
      <main className="flex-1">{children}</main>
      <div className="fixed bottom-4 left-4 z-50">
        <ConditionalLogout hideOnMercado />
      </div>
      <RealtimeNotificationToastClientWrapper />
    </div>
  );
}
