'use client';

import { useState } from 'react';
import { LoginForm } from './login-form';
import { LoginHero } from './login-hero';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { handleLoginSubmit } from '@/action-handlers/shared/auth';
import { toast } from 'sonner';
import { handleUserRole } from '@/lib/utils/role-router';
import { getUserRole } from '@/actions/shared/auth';
import { useQueryClient } from '@tanstack/react-query';
import { userKeys } from '@/hooks/tanstack/queries/userQueries';

export function LoginContainer() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleSubmit = async (email: string, password: string) => {
    setError(null);
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    startTransition(async () => {
      const { error } = await handleLoginSubmit(formData);

      if (error) {
        setError('Invalid email or password');
        toast.error('Login Failed', {
          description: 'Invalid email or password. Please try again.',
        });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: userKeys.session() });
      await queryClient.refetchQueries({ queryKey: userKeys.session() });

      // Get user role after successful login
      await handleUserRole({ router, setError, getUserRole });
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-card via-card to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Hero Section */}
          <LoginHero />

          {/* Form Section */}
          <div className="animate-slideInRight">
            <LoginForm onSubmit={handleSubmit} isSubmitting={isPending} />
          </div>
        </div>
      </div>
    </div>
  );
}
