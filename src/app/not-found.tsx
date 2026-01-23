'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const cause = encodeURIComponent('Page not found');
    const status = encodeURIComponent('404');
    const recommendation = encodeURIComponent('Check the URL or return to the login page.');

    router.replace(`/error?cause=${cause}&status=${status}&recommendation=${recommendation}`);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
        <p className="text-gray-600">Redirecting to error page...</p>
      </div>
    </div>
  );
}
