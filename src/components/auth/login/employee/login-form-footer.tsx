'use client';

import Link from 'next/link';

interface LoginFormFooterProps {
  disabled: boolean;
}

export function LoginFormFooter({ disabled }: LoginFormFooterProps) {
  return (
    <div className="mt-4 text-center">
      <div className="text-sm font-jersey text-amber-700">
        <span>Need admin access? </span>
        <Link
          href="/auth/adminlogin"
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          className={`underline transition-colors ${
            disabled
              ? 'pointer-events-none opacity-60'
              : 'hover:text-amber-900'
          }`}
        >
          Admin Login
        </Link>
      </div>
    </div>
  );
}
