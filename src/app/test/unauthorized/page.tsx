// src/app/test-errors/unauthorized/page.tsx
'use client';
import Unauthorized from '@/components/error/unauthorized';

export default function UnauthorizedPage() {
  return (
    <Unauthorized
      cause="User not authenticated"
      recommendation="Log in again to continue."
    />
  );
}
