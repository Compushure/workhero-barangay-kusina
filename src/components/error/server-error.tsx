'use client';
import ErrorPageLayout from './error-page-layout';

export default function ServerError({
  cause,
  recommendation,
}: {
  cause: string;
  recommendation: string;
}) {
  return (
    <ErrorPageLayout
      title="Server Error"
      status="500"
      description="Something went wrong on our side."
      cause={cause}
      recommendation={recommendation}
      imageSrc="/assets/500.png"
    />
  );
}
