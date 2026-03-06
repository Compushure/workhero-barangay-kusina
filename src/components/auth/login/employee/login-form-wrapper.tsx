'use client';

import { LoginForm } from './login-form';

interface LoginFormWrapperProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isBusy: boolean;
}

export function LoginFormWrapper({ onSubmit, isBusy }: LoginFormWrapperProps) {
  return (
    <div className="relative z-10 w-full max-w-md">
      <LoginForm onSubmit={onSubmit} isBusy={isBusy} />
    </div>
  );
}
