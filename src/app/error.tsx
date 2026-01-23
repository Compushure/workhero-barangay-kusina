'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Caught by error.tsx:', error);

    let status = '500';
    const cause = error.message || 'Unknown';
    let recommendation = 'Please try again later or contact support.';

    if (cause.startsWith('404')) {
      status = '404';
      recommendation = 'Check the URL or return to the login page.';
    } else if (cause.startsWith('400')) {
      status = '400';
      recommendation = 'Bad request. Please verify your input.';
    } else if (cause.includes('Unauthorized')) {
      status = '401';
      recommendation = 'Please log in again.';
    }

    router.replace(
      `/error?cause=${encodeURIComponent(cause)}&status=${encodeURIComponent(
        status
      )}&recommendation=${encodeURIComponent(recommendation)}`
    );
  }, [error, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
        <p className="text-gray-600">Redirecting to error page...</p>
        <button onClick={() => reset()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Try again
        </button>
      </div>
    </div>
  );
}
