import { Suspense } from 'react';
import type { Metadata } from 'next';
import { EmployeeLoginContainer } from '@/components/auth/login/employee/employee-login-container';
import { LoadingFallback } from '@/app/auth/adminlogin/page';
import { redirectifSessionExists } from '@/actions/shared/auth';

export const metadata: Metadata = {
  title: 'WorkHero | Login',
  icons: {
    icon: '/assets/website-logo.svg',
    shortcut: '/assets/website-logo.svg',
    apple: '/assets/website-logo.svg',
  },
};
export default async function LoginPage() {
  await redirectifSessionExists();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <EmployeeLoginContainer />
    </Suspense>
  );
}
