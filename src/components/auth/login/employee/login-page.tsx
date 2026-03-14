'use client';

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

      {/* Form Container with Z-indexing */}
      <div className="relative z-20 min-h-dvh flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
        <LoginFormWrapper onSubmit={onSubmit} isBusy={isBusy} />
      </div>
    </div>
  );
}
