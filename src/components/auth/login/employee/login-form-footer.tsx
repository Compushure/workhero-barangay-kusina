'use client';

import Link from 'next/link';
import { AuthHomeLink } from '@/components/auth/auth-home-link';

interface LoginFormFooterProps {
  disabled: boolean;
}

export function LoginFormFooter({ disabled }: LoginFormFooterProps) {
  return (
    <div className="mt-4 sm:mt-5 lg:mt-6 text-center">
      <div className="text-sm lg:text-base font-jersey text-amber-700">
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

      <div className="mt-3 flex justify-center">
        <AuthHomeLink
          className="inline-flex items-center gap-2 rounded-lg border-3 border-orange-900 bg-orange-100 px-3 py-2 font-pixel text-[8px] text-orange-900 shadow-[3px_3px_0px_rgba(71,51,31,0.4)] transition-all hover:-translate-y-0.5 hover:bg-orange-200 sm:text-[9px]"
          iconClassName="h-3.5 w-3.5 sm:h-4 sm:w-4"
        />
      </div>
    </div>
  );
}
