'use client';

import React, { Suspense, lazy } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LoginHeader } from './admin-login-header';
import { LoginForm } from './admin-login-form';

const FeatureList = lazy(() => import('./feature-list'));

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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
