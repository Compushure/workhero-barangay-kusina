'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface HrRouteErrorProps {
  error: Error & { digest?: string };
}

export default function HrRouteError({ error }: HrRouteErrorProps) {
  const router = useRouter();

  useEffect(() => {
    const cause = encodeURIComponent(error.message || 'Unexpected HR route error');
    const recommendation = encodeURIComponent('Please refresh the page or contact support if this persists.');
    router.replace(`/error?status=500&cause=${cause}&recommendation=${recommendation}`);
  }, [error, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-6 text-sm text-muted-foreground">
      Redirecting to error page...
    </div>
  );
}
