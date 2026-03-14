'use client';

import type React from 'react';
import { useState } from 'react';
import { Loader2, Shield } from 'lucide-react';
import { LoginFormFields } from './login-form-fields';
import { LoginFormFooter } from './login-form-footer';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isBusy: boolean;
}

export function LoginForm({ onSubmit, isBusy }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isBusy) return;
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(email, password);
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="w-full min-w-0 bg-linear-to-br from-orange-50 to-yellow-50 border-3 sm:border-4 border-amber-900 shadow-2xl p-4 sm:p-6 lg:p-7 overflow-hidden pixel-card"
      style={{ boxShadow: '0 10px 0 rgba(0,0,0,0.15), 0 14px 28px rgba(0,0,0,0.25)' }}
    >
      {/* Header Section */}
      <div className="mb-4 sm:mb-6 lg:mb-7 space-y-2 sm:space-y-3">
        <div className="text-center">
          <div className="mb-2 flex justify-center">
            <div
              className="h-11 w-11 sm:h-14 sm:w-14 lg:h-16 lg:w-16 bg-linear-to-br from-orange-400 to-orange-500 border-3 border-orange-900 rounded-lg flex items-center justify-center"
              style={{ boxShadow: '4px 4px 0px rgba(139,69,19,0.5)' }}
            >
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
            </div>
          </div>
          <h1
            className="text-base sm:text-lg lg:text-xl font-pixel text-orange-900 tracking-[0.04em] sm:tracking-widest leading-tight"
            style={{ textShadow: '2px 2px 0px rgba(139,69,19,0.2)' }}
          >
            WORKHERO
          </h1>
          <p className="text-sm sm:text-base lg:text-lg font-jersey text-amber-700 mt-1">
            Barangay Kusina
          </p>
          <p className="text-[10px] sm:text-xs lg:text-sm font-jersey text-amber-600 mt-2 wrap-break-word px-1">
            🍳 Employee Portal 🍳
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <LoginFormFields
          email={email}
          password={password}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          error={error}
          disabled={isSubmitting || isBusy}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isBusy}
          className="w-full bg-linear-to-br from-[#e89852] to-[#df8540] hover:from-[#de8b45] hover:to-[#d77b35] disabled:from-gray-400 disabled:to-gray-500 text-white font-jersey text-sm sm:text-base lg:text-xl tracking-wide border-3 sm:border-4 border-orange-900 py-1 sm:py-2 lg:py-2.5 px-3 sm:px-2 transition-all duration-100 transform active:translate-y-1 cursor-pointer pixel-button disabled:cursor-not-allowed"
          style={{
            boxShadow:
              isSubmitting || isBusy
                ? 'inset 4px 4px 0px rgba(0,0,0,0.3)'
                : '6px 6px 0px rgba(0,0,0,0.4)',
          }}
        >
          {isSubmitting || isBusy ? (
            <span className="flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap">
              <Loader2 className="w-4 h-4 animate-spin" />
              SIGNING IN...
            </span>
          ) : (
            'SIGN IN'
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-3 border-red-600 p-2 sm:p-2 pixel-box animate-shake">
            <p className="text-red-900 font-pixel text-center text-[8px] sm:text-[8px] lg:text-xs">{error}</p>
          </div>
        )}
      </form>

      {/* Footer */}
      <LoginFormFooter disabled={isSubmitting || isBusy} />
    </div>
  );
}
