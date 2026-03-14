'use client';

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface LoginFormFieldsProps {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  error: string;
  disabled: boolean;
}

export function LoginFormFields({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  error,
  disabled,
}: LoginFormFieldsProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-4">
      {/* Email Field */}
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="text-[8px] lg:text-xs font-pixel text-orange-900 block tracking-wide"
        >
          📧 EMAIL
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-600 pointer-events-none" />
          <input
            id="email"
            type="email"
            placeholder="chef@kusina.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="w-full pl-12 pr-3 py-2.5 bg-orange-100 border-3 border-orange-400 text-foreground font-jersey text-xs sm:text-sm focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-300 transition-all"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label
          htmlFor="password"
          className="text-[8px] lg:text-xs font-pixel text-orange-900 block tracking-wide"
        >
          🔐 PASSWORD
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-600 pointer-events-none" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="w-full pl-12 pr-12 py-2.5 bg-orange-100 border-3 border-orange-400 text-foreground font-jersey text-xs sm:text-sm focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-300 transition-all"
            disabled={disabled}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-600 hover:text-orange-800 hover:scale-110 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
