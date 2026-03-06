'use client';

import { Suspense } from 'react';
import { LoginBackground } from './login-background';
import { LoginFormWrapper } from './login-form-wrapper';

interface LoginPageProps {
  onSubmit: (email: string, password: string) => Promise<void>;
}

export function LoginPage({ onSubmit }: LoginPageProps) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-orange-50 via-yellow-50 to-orange-50">
      {/* Animated Background */}
      <LoginBackground />

      {/* Form Container with Z-indexing */}
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
          <LoginFormWrapper onSubmit={onSubmit} />
        </div>
      </Suspense>
    </div>
  );
}
