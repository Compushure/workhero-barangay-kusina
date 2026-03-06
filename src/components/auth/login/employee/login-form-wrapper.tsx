'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { LoginForm } from './login-form';

interface LoginFormWrapperProps {
  onSubmit: (email: string, password: string) => Promise<void>;
}

export function LoginFormWrapper({ onSubmit }: LoginFormWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // GSAP animations on mount
    gsap.from(containerRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: 'power2.out',
    });

    // Subtle floating animation
    gsap.to(containerRef.current, {
      y: -8,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-md relative z-10"
    >
      <LoginForm onSubmit={onSubmit} />
    </div>
  );
}
