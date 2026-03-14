"use client";
import ErrorRouter from '@/components/error/error-router';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const cause = error.message || 'Unknown';
  let status = '500';
  let recommendation = 'Please try again later or contact support.';

  if (cause.startsWith('400')) {
    status = '400';
    recommendation = 'Bad request. Please verify your input.';
  } else if (cause.includes('Unauthorized')) {
    status = '401';
    recommendation = 'Please log in again.';
  } else if (cause.startsWith('403')) {
    status = '403';
    recommendation = 'You do not have permission to view this page.';
  } else if (cause.startsWith('404')) {
    status = '404';
    recommendation = 'Check the URL or return to the login page.';
  }

  return <ErrorRouter status={status} cause={cause} recommendation={recommendation} />;
}
