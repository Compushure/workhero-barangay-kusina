// src/app/test-errors/bad-request/page.tsx
'use client';
import BadRequest from '@/components/error/bad-request';

export default function BadRequestPage() {
  return (
    <BadRequest
      cause="Invalid query parameter"
      recommendation="Please verify your input and try again."
    />
  );
}
