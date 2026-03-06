'use client';

import Link from 'next/link';

export function SuperadminLoginFormFooter() {
  return (
    <div className="mt-6 pt-6 border-t border-[#f47812]/15">
      <p className="text-center text-sm text-gray-600 mb-3">Not an admin?</p>
      <Link href="/auth/login">
        <button className="w-full px-4 py-2 border border-[#f47812]/20 rounded-lg text-sm font-medium text-gray-700 hover:bg-[#fcf6e3] transition-colors cursor-pointer">
          Employee Login
        </button>
      </Link>
    </div>
  );
}
