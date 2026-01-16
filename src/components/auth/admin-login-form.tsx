'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Mail } from 'lucide-react';
import { handleLoginSubmit } from '@/action-handlers/auth';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@/actions/auth';
import { handleUserRole } from '@/lib/utils/role-router';

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const { error } = await handleLoginSubmit(formData);
      if (error) {
        setError('Invalid email or password');
        toast.error('Login Failed', {
          description: 'Invalid email or password. Please try again.',
        });
        return;
      }
      await handleUserRole({ router, setError, getUserRole });
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 px-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="admin@compushure.com"
            className="pl-10"
            disabled={isPending}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            className="pl-10"
            disabled={isPending}
            required
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full h-11 cursor-pointer bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95"
        disabled={isPending}
      >
        {isPending ? 'Signing in...' : 'Sign In'}
      </Button>

      <div className="pt-4 pb-6">
        <p className="text-xs text-center text-gray-500">
          Demo Credentials:
          <br />
          Superadmin: tonilegayada@gmail.com / Admin123
          <br />
          User: gpuser@gpmail.com / Admin123
        </p>
      </div>
    </form>
  );
}
