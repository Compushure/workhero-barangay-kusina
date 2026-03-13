'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';

function ErrorPageContent() {
  const params = useSearchParams();
  const router = useRouter();

  const status = params.get('status') || '500';
  const cause = params.get('cause') || 'Unknown error';
  const recommendation = params.get('recommendation') || 'Please try again later.';
  const returnTo = params.get('returnTo');

  const safeReturnTo =
    returnTo && returnTo.startsWith('/') && !returnTo.startsWith('/error') ? returnTo : null;

  const handleGoBack = () => {
    if (safeReturnTo) {
      router.push(safeReturnTo);
      return;
    }

    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    router.push('/auth/login');
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  // http://localhost:3008/error?status=404&cause=Page%20not%20found&recommendation=Check%20the%20URL%20or%20go%20back.
  let title = 'Something went wrong';
  let icon = '💥';
  let description = cause;

  if (status === '400') {
    title = 'Bad Request';
    icon = '⚠️';
    description = 'Your request couldn’t be understood.';
  } else if (status === '401') {
    title = 'Unauthorized';
    icon = '🔒';
    description = 'You need to log in to access this page.';
  } else if (status === '404') {
    title = 'This Plate is Empty';
    icon = '🍽️';
    description = 'The page you’re looking for isn’t on our menu.';
  } else if (status === '500') {
    title = 'Server Error';
    icon = '🔥';
    description = 'Something went wrong on our side.';
  } else if (status === '403') {
    title = 'Access Denied';
    icon = '⛔';
    description = 'You do not have permission to view this page.';
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="text-7xl">{icon}</div>
              <CardTitle className="text-2xl">{title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-6xl font-bold text-primary/20">{status}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
              <p className="text-xs text-muted-foreground">Cause: {decodeURIComponent(cause)}</p>
              <p className="text-xs text-muted-foreground">
                Recommendation: {decodeURIComponent(recommendation)}
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-4">
              {status === '404' ? (
                <>
                  <Button variant="default" className="w-full" onClick={handleGoBack}>
                    Go Back
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleBackToLogin}>
                    Back to Login
                  </Button>
                </>
              ) : (
                <Button variant="default" className="w-full" onClick={handleBackToLogin}>
                  Back to Login
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
          Loading...
        </div>
      }
    >
      <ErrorPageContent />
    </Suspense>
  );
}
