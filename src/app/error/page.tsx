import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
              <CardTitle className="text-2xl">Sorry, something went wrong.</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Error Status:</p>
                <p className="text-lg font-mono">{status}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Cause:</p>
                <p className="text-sm">{decodeURIComponent(cause)}</p>
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
