'use client';

import Link from 'next/link';
import { AuthHomeLink } from '@/components/auth/auth-home-link';

export function SuperadminLoginFormFooter() {
  return (
    <div className="mt-4 pt-4 border-t border-[#f47812]/15">
      <p className="text-center text-sm text-gray-600 mb-3">Not an admin?</p>
      <Link href="/auth/login">
        <button className="w-full px-4 py-2.5 border border-[#f47812]/20 rounded-lg text-sm font-medium text-gray-700 hover:bg-[#fcf6e3] transition-colors cursor-pointer">
          Employee Login
        </button>
      </Link>
      <div className="mt-3 flex justify-center">
        <AuthHomeLink
          className="inline-flex items-center gap-2 rounded-lg border border-[#f47812]/20 bg-[#fff8ef] px-3 py-2 text-sm font-medium text-[#8b4513] transition-colors hover:bg-[#fcf1df]"
          iconClassName="h-4 w-4 text-[#f47812]"
        />
      </div>
    </div>
  );
}
