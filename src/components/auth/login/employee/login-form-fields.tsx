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
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-[10px] sm:text-xs lg:text-sm font-pixel text-orange-900 block tracking-wide sm:tracking-wider">
          📧 EMAIL
        </Label>
        <div className="relative">
          <Mail className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600 pointer-events-none" />
          <input
            id="email"
            type="email"
            placeholder="chef@kusina.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="w-full pl-9 sm:pl-10 lg:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 lg:py-3.5 bg-orange-100 border-3 border-orange-400 text-foreground font-jersey text-sm sm:text-base lg:text-lg focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-300 transition-all"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label
          htmlFor="password"
          className="text-[10px] sm:text-xs lg:text-sm font-pixel text-orange-900 block tracking-wide sm:tracking-wider"
        >
          🔐 PASSWORD
        </Label>
        <div className="relative">
          <Lock className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600 pointer-events-none" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="w-full pl-9 sm:pl-10 lg:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 lg:py-3.5 bg-orange-100 border-3 border-orange-400 text-foreground font-jersey text-sm sm:text-base lg:text-lg focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-300 transition-all"
            disabled={disabled}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-600 hover:text-orange-800 hover:scale-110 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />}
          </button>
        </div>
      </div>
    </div>
  );
}
