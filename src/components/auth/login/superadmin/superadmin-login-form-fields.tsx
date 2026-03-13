'use client';

import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface SuperadminLoginFormFieldsProps {
  email: string;
  password: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
}

export function SuperadminLoginFormFields({
  email,
  password,
  onEmailChange,
  onPasswordChange,
}: SuperadminLoginFormFieldsProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm lg:text-base font-semibold text-gray-700">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-400 pointer-events-none" />
          <input
            id="email"
            type="email"
            placeholder="admin@barangaykusina.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="w-full pl-9 sm:pl-10 lg:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 lg:py-3.5 bg-[#FFFDF5] border border-[#f47812]/20 text-gray-900 text-sm sm:text-base lg:text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f47812]/40 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm lg:text-base font-semibold text-gray-700">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-400 pointer-events-none" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="w-full pl-9 sm:pl-10 lg:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 lg:py-3.5 bg-[#FFFDF5] border border-[#f47812]/20 text-gray-900 text-sm sm:text-base lg:text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f47812]/40 focus:border-transparent transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            ) : (
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
