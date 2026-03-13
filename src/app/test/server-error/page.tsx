// src/app/test-errors/server-error/page.tsx
'use client';
import ServerError from '@/components/error/server-error';

export default function ServerErrorPage() {
  return (
    <ServerError
      cause="Database connection failed"
      recommendation="Please try again later."
    />
  );
}
