'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { handleLoginSubmit } from '@/action-handlers/shared/auth';
import { getUserRole } from '@/actions/shared/auth';
import { handleUserRole } from '@/lib/utils/role-router';
import { userKeys } from '@/hooks/tanstack/queries/userQueries';
import { SuperadminLoginPage } from './superadmin-login-page';

export function SuperadminLoginContainer() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [, startTransition] = useTransition();

  const handleSubmit = async (email: string, password: string) => {
    // Create FormData from email and password to match server action signature
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
        } catch (err) {
          toast.error('Login Error', {
            description: 'An unexpected error occurred. Please try again.',
          });
          reject(err);
        }
      });
    });
  };

  return <SuperadminLoginPage onSubmit={handleSubmit} />;
}
