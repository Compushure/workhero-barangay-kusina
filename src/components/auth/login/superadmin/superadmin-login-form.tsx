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
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-[#f47812]/15 w-full min-w-0">
      {/* Header - Darker orange gradient for better contrast */}
      <div className="bg-linear-to-r from-[#f47812] to-[#faa938] px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 lg:py-7">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:gap-4 mb-2.5 sm:mb-4">
          <div className="bg-white/20 p-2.5 sm:p-3 lg:p-3.5 rounded-lg">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
          </div>
          <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white text-center leading-tight">Admin Portal</h1>
        </div>
        <p className="text-white/80 text-center text-[11px] sm:text-sm lg:text-base leading-snug">
          Super Administrator Access
        </p>
      </div>

      {/* Form Content */}
      <div className="p-3 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 lg:space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200/50 rounded-lg p-3 sm:p-4">
              <p className="text-red-700 text-xs sm:text-sm lg:text-base font-medium">
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
            className="w-full bg-[#f47812] hover:bg-[#e67010] disabled:bg-gray-400 text-white font-semibold text-sm sm:text-base lg:text-lg py-2.5 sm:py-3 lg:py-3.5 px-4 rounded-lg transition-all duration-200 transform hover:shadow-lg active:scale-95 cursor-pointer"
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
