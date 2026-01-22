import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ cause?: string; status?: string; recommendation?: string }>;
}) {
  const params = await searchParams;
  const cause = params.cause || 'Unknown';
  const status = params.status || '500';
  const recommendation = params.recommendation || 'Please try again later or contact support.';

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-center">
                <Image
                  src="/500.png"
                  alt="500 Error Illustration"
                  width={500}
                  height={500}
                  className="object-contain"
                  priority
                />
              </div>
              <CardTitle className="text-2xl text-center">Oops! The Pot’s Overflowed.</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Error Status:</p>
                <p className="text-lg text-red-400 font-mono">{status}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Cause:</p>
                <p className="text-sm text-yellow-600">{decodeURIComponent(cause)}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Recommendation:</p>
                <p className="text-sm">{decodeURIComponent(recommendation)}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button asChild variant="default" className="w-full">
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
