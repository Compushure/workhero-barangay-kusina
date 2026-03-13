'use client';

import { useSearchParams } from 'next/navigation';
import ErrorRouter from '@/components/error/error-router';

export default function ErrorPage() {
  const params = useSearchParams();

  return (
    <ErrorRouter
      status={params.get('status') ?? '500'}
      cause={params.get('cause') ?? 'Unknown error'}
      recommendation={params.get('recommendation') ?? 'Please try again later.'}
    />
  );
}
