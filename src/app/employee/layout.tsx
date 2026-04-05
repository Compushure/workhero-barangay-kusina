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
    <div className="flex min-h-dvh w-full overflow-x-clip overflow-y-hidden bg-[#2f2a45]">
      <EmployeeTypographyScope />
      <ToastViewSync view="employee" />
      <NavLoadingState />
      <main className="flex min-w-0 flex-1 flex-col overflow-x-clip bg-[#2f2a45]">{children}</main>
      {/* <div className="fixed bottom-4 left-4 z-50">
        <ConditionalLogout hideOnMercado />
      </div> */}
      <LevelDebugLayoutMount />
      <RealtimeNotificationToastClientWrapper />
    </div>
  );
}

// import { protectEmployeeRoute } from '@/actions/shared/auth';
// import { RealtimeNotificationToastClientWrapper } from '@/components/notifications/realtime-notification-toast-client-wrapper';
// import { ConditionalLogout } from '@/components/employee/conditional-logout';
// import { ConditionalNotifications } from '@/components/employee/conditional-notifications';
// import { ConditionalMapLauncher } from '@/components/employee/conditional-map-launcher';
// import { NavLoadingState } from '@/components/employee/nav-loading-state';
// import LevelDebugLayoutMount from '@/components/employee/widgets/test/level/level-debug-layout-mount';

// export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
//   await protectEmployeeRoute();
//   return (
//     <div className="flex min-h-screen">
//       <NavLoadingState />
//       <div className="fixed right-4 top-4 z-50">
//         <ConditionalNotifications hideOnMercado />
//       </div>
//       <ConditionalMapLauncher hideOnMercado />
//       <main className="flex-1">{children}</main>
//       <div className="fixed bottom-4 left-4 z-50">
//         <ConditionalLogout hideOnMercado />
//       </div>
//       <LevelDebugLayoutMount />
//       <RealtimeNotificationToastClientWrapper />
//     </div>
//   );
// }
