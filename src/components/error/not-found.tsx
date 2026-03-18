'use client';
import ErrorPageLayout from './error-page-layout';

export default function NotFound({
  cause,
  recommendation,
}: {
  cause: string;
  recommendation: string;
}) {
  return (
    <ErrorPageLayout
      title="Not Found"
      status="404"
      description="The page you’re looking for isn’t on our system."
      cause={cause}
      recommendation={recommendation}
      imageSrc="/assets/404.png"
    />
  );
}
