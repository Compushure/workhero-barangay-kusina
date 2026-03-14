'use client';
import ErrorPageLayout from './error-page-layout';

export default function AccessDenied({
  cause,
  recommendation,
}: {
  cause: string;
  recommendation: string;
}) {
  return (
    <ErrorPageLayout
      title="Access Denied"
      status="403"
      description="You do not have permission to view this page."
      cause={cause}
      recommendation={recommendation}
      imageSrc="/assets/403.png"
    />
  );
}
