'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function ErrorPageLayout({
  title,
  status,
  description,
  cause,
  recommendation,
  imageSrc,
}: {
  title: string;
  status: string;
  description: string;
  cause: string;
  recommendation: string;
  imageSrc?: string;
}) {
  const router = useRouter();

  return (
    <section className="min-h-svh bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full max-w-xl space-y-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Error code: {status}
          </p>
          <div className="space-y-3">
            <h1 className="text-5xl font-bold leading-tight text-gray-900 md:text-6xl">Oops!</h1>
            <h2 className="text-3xl font-semibold text-gray-900 md:text-4xl">{title}</h2>
            <p className="text-lg text-gray-800">{description}</p>
          </div>

          <div className="space-y-2 rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Cause:</span> {decodeURIComponent(cause)}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Recommendation:</span>{' '}
              {decodeURIComponent(recommendation)}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
            <Button className="w-full sm:w-auto" variant="default" onClick={() => router.back()}>
              Go Back
            </Button>
            <Button className="w-full sm:w-auto" variant="secondary" asChild>
              <Link href="/auth/login">Back to Login</Link>
            </Button>
          </div>
        </div>

        <div className="w-full max-w-lg lg:max-w-xl mt-10">
          {imageSrc ? (
            <div className="flex justify-center">
              <img
                src={imageSrc}
                alt="Error illustration"
                className="h-auto max-h-[360px] w-full max-w-sm object-contain md:max-w-md"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
