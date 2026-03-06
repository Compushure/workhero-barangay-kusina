import { Suspense } from 'react';
import { EmployeeLoginContainer } from '@/components/auth/login/employee/employee-login-container';
import { LoadingFallback } from '@/app/auth/adminlogin/page';
import { redirectifSessionExists } from '@/actions/shared/auth';
export default async function LoginPage() {
  await redirectifSessionExists();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <EmployeeLoginContainer />
    </Suspense>
  );
}
