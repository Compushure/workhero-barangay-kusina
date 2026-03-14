'use client';

import type React from 'react';
import { useState } from 'react';
import { Loader2, Shield } from 'lucide-react';
import { SuperadminLoginFormFields } from './superadmin-login-form-fields';
import { SuperadminLoginFormFooter } from './superadmin-login-form-footer';

interface SuperadminLoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
}

export function SuperadminLoginForm({ onSubmit }: SuperadminLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(email, password);
    } catch (err) {
      setError('Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-[#f47812]/15 w-full min-w-0">
      {/* Header - streamlined padding and sizing */}
      <div className="bg-linear-to-r from-[#f47812] to-[#faa938] px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="bg-white/20 p-2 sm:p-2.5 rounded-lg">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white text-center leading-tight">Admin Portal</h1>
        </div>
        <p className="text-white/80 text-center text-xs sm:text-sm leading-snug">
          Super Administrator Access
        </p>
      </div>

      {/* Form Content */}
      <div className="p-4 sm:p-5">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200/50 rounded-lg p-3">
              <p className="text-red-700 text-sm font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Form Fields */}
          <SuperadminLoginFormFields
            email={email}
            password={password}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#f47812] hover:bg-[#e67010] disabled:bg-gray-400 text-white font-semibold text-base py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:shadow-md active:scale-95 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <SuperadminLoginFormFooter />
      </div>
    </div>
  );
}
