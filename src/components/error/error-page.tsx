'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ErrorRouter from '@/components/error/error-router';
import { CookingPot } from 'lucide-react';

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <CookingPot className="size-10 animate-bounce" />
        <span>Loading error details...</span>
      </div>
    </div>
  );
}

function ErrorPageContent() {
  const params = useSearchParams();

  return (
    <ErrorRouter
      status={params.get('status') ?? '500'}
      cause={params.get('cause') ?? 'Unknown error'}
      recommendation={params.get('recommendation') ?? 'Please try again later.'}
    />
  );
}

export default function ErrorPageClient() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ErrorPageContent />
    </Suspense>
  );
}
