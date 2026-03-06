'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { handleLoginSubmit } from '@/action-handlers/shared/auth';
import { getUserRole } from '@/actions/shared/auth';
import { handleUserRole } from '@/lib/utils/role-router';
import { userKeys } from '@/hooks/tanstack/queries/userQueries';
import { LoginPage } from './login-page';

export function EmployeeLoginContainer() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [, startTransition] = useTransition();

  const handleSubmit = async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          const { error: loginError } = await handleLoginSubmit(formData);
          if (loginError) {
            toast.error('Login Failed', {
              description: loginError,
            });
            reject(new Error(loginError));
            return;
          }

          await queryClient.invalidateQueries({ queryKey: userKeys.session() });
          await queryClient.refetchQueries({ queryKey: userKeys.session() });
          await handleUserRole({ router, setError: () => {}, getUserRole });

          resolve();
        } catch (error) {
          toast.error('Login Error', {
            description: 'An unexpected error occurred. Please try again.',
          });
          reject(error);
        }
      });
    });
  };

  return <LoginPage onSubmit={handleSubmit} />;
}
