'use client';

import Image from 'next/image';
import { SuperadminLoginBackground } from './superadmin-login-background';
import { SuperadminLoginFormWrapper } from './superadmin-login-form-wrapper';

interface SuperadminLoginPageProps {
  onSubmit: (email: string, password: string) => Promise<void>;
}

export function SuperadminLoginPage({ onSubmit }: SuperadminLoginPageProps) {
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center bg-[#fcf6e3] overflow-hidden">
      {/* Animated Background */}
      <SuperadminLoginBackground />
      <Image
        src="/assets/home/features-bg.png"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="pointer-events-none absolute inset-0 z-10 object-cover opacity-[0.26] mix-blend-multiply"
      />
      <div className="pointer-events-none absolute inset-0 z-[11] bg-[linear-gradient(180deg,rgba(252,246,227,0.2),rgba(244,120,18,0.14)_55%,rgba(78,39,12,0.12)_100%)]" />

      {/* Form Container with Z-indexing */}
      <div className="relative z-20 w-full flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
        <SuperadminLoginFormWrapper onSubmit={onSubmit} />
      </div>
    </div>
  );
}
