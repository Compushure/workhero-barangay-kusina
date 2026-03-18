'use client';
import ErrorPageLayout from './error-page-layout';

export default function BadRequest({ cause, recommendation }: { cause: string; recommendation: string }) {
  return (
    <ErrorPageLayout
      title="Bad Request"
      status="400"
      description="Your request couldn’t be understood."
      cause={cause}
      recommendation={recommendation}
      imageSrc="/assets/400.png"
    />
  );
}
