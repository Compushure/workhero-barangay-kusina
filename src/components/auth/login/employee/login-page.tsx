'use client';

import Image from 'next/image';
import { LoginBackground } from './login-background';
import { LoginFormWrapper } from './login-form-wrapper';

interface LoginPageProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isBusy: boolean;
}

export function LoginPage({ onSubmit, isBusy }: LoginPageProps) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-linear-to-b from-orange-50 via-yellow-50 to-orange-50">
      {/* Animated Background */}
      <LoginBackground />
      <Image
        src="/assets/home/hero-bg.png"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="pointer-events-none absolute inset-0 z-[6] object-cover opacity-[0.28] mix-blend-multiply"
      />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_top,rgba(223,133,64,0.22),transparent_42%),linear-gradient(180deg,rgba(124,61,20,0.16),rgba(255,246,232,0.08)_38%,rgba(223,133,64,0.14)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(135deg,rgba(255,255,255,0.02),rgba(115,54,18,0.12))]" />

      {/* Form Container with Z-indexing */}
      <div className="relative z-20 min-h-dvh flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
        <LoginFormWrapper onSubmit={onSubmit} isBusy={isBusy} />
      </div>
    </div>
  );
}
