import { Suspense } from 'react';
import { EmployeeLoginContainer } from '@/components/auth/login/employee/employee-login-container';
import { redirectifSessionExists } from '@/actions/shared/auth';
import { LoginCogSuspense } from '@/components/shared/login-cog-suspense';
export default async function LoginPage() {
  await redirectifSessionExists();

  return (
    <Suspense fallback={<LoginCogSuspense label="Loading employee login..." />}>
      <EmployeeLoginContainer />
    </Suspense>
  );
}
