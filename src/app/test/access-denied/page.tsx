// src/app/test-errors/access-denied/page.tsx
'use client';
import AccessDenied from '@/components/error/access-denied';

export default function AccessDeniedPage() {
  return (
    <AccessDenied
      cause="Restricted resource"
      recommendation="Contact your administrator for access."
    />
  );
}
