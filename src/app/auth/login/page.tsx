import { Suspense } from 'react';
import { LoginContainer } from '@/components/login/login-base/login-container';
import { LoadingFallback } from '@/app/admin/page';
export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginContainer />
    </Suspense>
  );
}
