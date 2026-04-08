import { protectEmployeeRoute } from '@/actions/shared/auth';
import { EmployeeTypographyScope } from '@/components/employee/employee-typography-scope';
import { RealtimeNotificationToastClientWrapper } from '@/components/notifications/realtime-notification-toast-client-wrapper';
import { NavLoadingState } from '@/components/employee/nav-loading-state';
import { ToastViewSync } from '@/components/ui/sonner';
// import { ConditionalLogout } from '@/components/employee/conditional-logout';
// import { ConditionalNotifications } from '@/components/employee/conditional-notifications';
// import { ConditionalMapLauncher } from '@/components/employee/conditional-map-launcher';
import LevelDebugLayoutMount from '@/components/employee/widgets/test/level/level-debug-layout-mount';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await protectEmployeeRoute();
  return (
    <div className="flex min-h-dvh w-full overflow-x-clip overflow-y-hidden bg-transparent">
      <EmployeeTypographyScope />
      <ToastViewSync view="employee" />
      <NavLoadingState />
      <main className="flex min-w-0 flex-1 flex-col overflow-x-clip bg-transparent">{children}</main>
      {/* <div className="fixed bottom-4 left-4 z-50">
        <ConditionalLogout hideOnMercado />
      </div> */}
      {/* <LevelDebugLayoutMount /> */}
      <RealtimeNotificationToastClientWrapper />
    </div>
  );
}
