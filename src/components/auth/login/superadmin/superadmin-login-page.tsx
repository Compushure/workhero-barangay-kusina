'use client';

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

      {/* Form Container with Z-indexing */}
      <div className="relative z-20 w-full flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
        <SuperadminLoginFormWrapper onSubmit={onSubmit} />
      </div>
    </div>
  );
}
