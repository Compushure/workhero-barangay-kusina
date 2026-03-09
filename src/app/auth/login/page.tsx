import { Suspense } from 'react';
import { LoginCogSuspense } from '@/components/shared/login-cog-suspense';
import type { Metadata } from 'next';
import { EmployeeLoginContainer } from '@/components/auth/login/employee/employee-login-container';
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
    <Suspense fallback={<LoginCogSuspense label="Loading employee login..." />}>
      <EmployeeLoginContainer />
    </Suspense>
  );
}
