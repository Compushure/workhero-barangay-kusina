'use client';

import type React from 'react';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { LoginFormFields } from './login-form-fields';
import { LoginFormFooter } from './login-form-footer';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
    <div className="w-full bg-gradient-to-br from-orange-50 to-yellow-50 border-4 border-amber-900 shadow-2xl p-8 overflow-hidden pixel-card" style={{ boxShadow: '0 10px 0 rgba(0,0,0,0.15), 0 14px 28px rgba(0,0,0,0.25)' }}>
      {/* Header Section */}
      <div className="mb-8 space-y-4">
        {/* Logo Placeholder */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 border-3 border-orange-900 rounded-lg flex items-center justify-center" style={{ boxShadow: '4px 4px 0px rgba(139,69,19,0.5)' }}>
            <span className="text-2xl font-bold text-white font-pixel">WH</span>
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-pixel text-orange-900 tracking-widest" style={{ textShadow: '2px 2px 0px rgba(139,69,19,0.2)' }}>
            WORKHERO
          </h1>
          <p className="text-lg font-jersey text-amber-700 mt-1">
            Barangay Kusina
          </p>
          <p className="text-xs font-jersey text-amber-600 mt-2">
            🍳 Employee Portal 🍳
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <LoginFormFields
          email={email}
          password={password}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          error={error}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-pixel text-sm border-4 border-orange-900 py-4 px-4 transition-all duration-100 transform active:translate-y-1 cursor-pointer pixel-button"
          style={{
            boxShadow: isSubmitting
              ? 'inset 4px 4px 0px rgba(0,0,0,0.3)'
              : '6px 6px 0px rgba(0,0,0,0.4)',
            letterSpacing: '0.1em',
          }}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              SIGNING IN
            </span>
          ) : (
            'SIGN IN'
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-3 border-red-600 p-4 pixel-box animate-shake">
            <p className="text-red-900 font-pixel text-xs">
              {error}
            </p>
          </div>
        )}
      </form>

      {/* Footer */}
      <LoginFormFooter />

      {/* Decorative Elements */}
      <div className="mt-8 pt-6 border-t-2 border-dashed border-orange-200 flex justify-center gap-4">
        <div className="text-2xl">☕</div>
        <div className="text-2xl">🏠</div>
        <div className="text-2xl">🍽️</div>
      </div>
    </div>
  );
}
