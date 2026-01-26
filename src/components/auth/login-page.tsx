'use client';

import React, { Suspense, lazy } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { LoginHeader } from './admin-login-header';
import { LoginForm } from './admin-login-form';

const FeatureList = lazy(() => import('./feature-list').then((mod) => ({ default: mod.FeatureList })));

export function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Side: Hero Section */}
        <Suspense fallback={<div>Loading...</div>}>
          <FeatureList />
        </Suspense>

        {/* Right Side: Login Form */}
        <Card className="w-full border border-gray-200 shadow-2xl bg-white rounded-xl p-0 animate-scaleIn overflow-hidden">
          <LoginHeader />
          <CardContent>
            <LoginForm />
            <div className="mt-4 pt-4 border-t border-gray-200 pb-2">
              <p className="text-center text-sm text-muted-foreground mb-3">Not an admin?</p>
              <Link href="/auth/login">
                <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">
                  Employee Login
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
