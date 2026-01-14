'use client';

import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoginFormFields } from '../sign-in/sign-in-form-fields';
import { LoginFormHeader } from '../sign-in/sign-in-form-header';
import { Loader2 } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isSubmitting: boolean;
}

export function LoginForm({ onSubmit, isSubmitting }: LoginFormProps) {
  const [mode] = useState<'signin'>('signin');

  // Sign In State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    try {
      await onSubmit(email, password);
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm border-border/50 shadow-2xl animate-scaleIn overflow-hidden">
      <div className="p-8 md:p-10">
        <div className="relative overflow-hidden">
          {/* Sign In Form */}
          <div
            className={`transition-all duration-500 ease-out origin-center ${
              mode === 'signin'
                ? 'opacity-100 translate-x-0 pointer-events-auto'
                : 'absolute opacity-0 translate-x-full pointer-events-none'
            }`}
          >
            <LoginFormHeader />
            <form onSubmit={handleSignInSubmit} className="space-y-6">
              <LoginFormFields
                email={email}
                password={password}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                error={error}
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Card>
  );
}
