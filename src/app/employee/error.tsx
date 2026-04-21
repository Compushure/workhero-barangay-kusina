'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface EmployeeRouteErrorProps {
  error: Error & { digest?: string };
}

export default function EmployeeRouteError({ error }: EmployeeRouteErrorProps) {
  const router = useRouter();

  useEffect(() => {
    const cause = encodeURIComponent(error.message || 'Unexpected employee route error');
    const recommendation = encodeURIComponent(
      'Please refresh the page or contact support if this persists.'
    );
    router.replace(`/error?status=500&cause=${cause}&recommendation=${recommendation}`);
  }, [error, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-6 text-sm text-muted-foreground">
      Redirecting to error page...
    </div>
  );
}
