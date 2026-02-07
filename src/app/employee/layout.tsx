<<<<<<< HEAD
// import { protectEmployeeRoute } from '@/actions/auth';
// import { Sidebar } from '@/components/employee/sidebar';
=======
import { protectEmployeeRoute } from '@/actions/shared/auth';
import { Sidebar } from '@/components/employee/sidebar';
>>>>>>> 38c64158741778bd2e508317d1c1b2066239dfbb

// export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
//   await protectEmployeeRoute();
//   return (
//     <div className="flex min-h-screen">
//       <Sidebar />
//       <main className="flex-1">{children}</main>
//     </div>
//   );
// }

import { protectEmployeeRoute } from '@/actions/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await protectEmployeeRoute();
  return (
    <div className="flex min-h-screen">
      <main className="flex-1">{children}</main>
    </div>
  );
}
