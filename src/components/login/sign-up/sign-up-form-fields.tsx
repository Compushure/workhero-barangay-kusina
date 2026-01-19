'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SignupFormFieldsProps {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  onFullNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  error: string;
}

export function SignupFormFields({
  fullName,
  email,
  password,
  confirmPassword,
  onFullNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  error,
}: SignupFormFieldsProps) {
  const passwordMatch = password && confirmPassword && password === confirmPassword;
  const passwordStrong = password && password.length >= 8;

  return (
    <div className="space-y-5">
      {/* Full Name Field */}
      <div className="space-y-2">
        <Label htmlFor="fullname" className="text-sm font-medium text-foreground">
          Full Name
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <Input
            id="fullname"
            type="text"
            placeholder="Juan Dela Cruz"
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            className="pl-10 bg-input border-border/50 focus:border-primary focus:ring-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email-signup" className="text-sm font-medium text-foreground">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <Input
            id="email-signup"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="pl-10 bg-input border-border/50 focus:border-primary focus:ring-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password-signup" className="text-sm font-medium text-foreground">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <Input
            id="password-signup"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="pl-10 bg-input border-border/50 focus:border-primary focus:ring-primary/50 transition-colors"
          />
        </div>
        {password && (
          <p
            className={`text-xs ${passwordStrong ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}
          >
            {passwordStrong ? 'Strong password' : 'Use at least 8 characters'}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
          Confirm Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            className="pl-10 bg-input border-border/50 focus:border-primary focus:ring-primary/50 transition-colors"
          />
          {confirmPassword && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {passwordMatch ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-destructive/30" />
              )}
            </div>
          )}
        </div>
        {confirmPassword && !passwordMatch && (
          <p className="text-xs text-destructive">Passwords do not match</p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3 animate-fadeInUp">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
