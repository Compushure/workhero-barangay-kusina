import { Suspense } from 'react';
import { protectHRRoute } from '@/actions/auth';
import { Sidebar } from '@/components/hr/sidebar';
import { FullPageLoadingSkeleton } from '@/components/ui/skeleton';

export default async function HRLayout({ children }: { children: React.ReactNode }) {
  await protectHRRoute();
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        <Suspense fallback={<FullPageLoadingSkeleton message="Loading HR Dashboard..." />}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
