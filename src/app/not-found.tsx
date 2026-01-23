'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a short loading state before showing the 404 UI
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800); // adjust delay as needed

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    // ✅ Spinner fallback (same style as 500 error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
          <p className="text-gray-600">Loading 404 page...</p>
        </div>
      </div>
    );
  }

  // ✅ Your existing 404 card UI
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="text-7xl">🍽️</div>
                <CardTitle className="text-2xl">This Plate is Empty</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-6xl font-bold text-primary/20">404</p>
                <p className="text-sm text-muted-foreground">
                  The page you&apos;re looking for isn&apos;t on our menu.
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-4">
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => router.back()}
                >
                  Go Back
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth/login">Back to Login</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
