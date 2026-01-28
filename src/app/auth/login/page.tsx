import { Suspense } from 'react';
import { LoginContainer } from '@/components/login/login-base/login-container';
import { LoadingFallback } from '@/app/auth/adminlogin/page';
import { redirectifSessionExists } from '@/actions/auth';
export default async function LoginPage() {
  await redirectifSessionExists();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginContainer />
    </Suspense>
  );
}
