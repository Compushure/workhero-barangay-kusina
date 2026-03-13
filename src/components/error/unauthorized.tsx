'use client';
import ErrorPageLayout from './error-page-layout';

export default function Unauthorized({
  cause,
  recommendation,
}: {
  cause: string;
  recommendation: string;
}) {
  return (
    <ErrorPageLayout
      title="Unauthorized"
      status="401"
      description="You need to log in to access this page."
      cause={cause}
      recommendation={recommendation}
      imageSrc="/assets/401.png"
    />
  );
}
