'use client';

import Link from 'next/link';

export function SuperadminLoginFormFooter() {
  return (
    <div className="mt-5 sm:mt-6 lg:mt-7 pt-5 sm:pt-6 border-t border-[#f47812]/15">
      <p className="text-center text-sm lg:text-base text-gray-600 mb-3">Not an admin?</p>
      <Link href="/auth/login">
        <button className="w-full px-4 py-2.5 sm:py-2.5 lg:py-3 border border-[#f47812]/20 rounded-lg text-sm lg:text-base font-medium text-gray-700 hover:bg-[#fcf6e3] transition-colors cursor-pointer">
          Employee Login
        </button>
      </Link>
    </div>
  );
}
