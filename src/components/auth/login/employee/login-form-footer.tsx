'use client';

import Link from 'next/link';

export function LoginFormFooter() {
  return (
    <div className="mt-4 text-center">
      <div className="text-xs font-jersey text-amber-700">
        <span>Need admin access? </span>
        <Link href="/auth/adminlogin" className="underline hover:text-amber-900 transition-colors">
          Admin Login
        </Link>
      </div>
    </div>
  );
}
