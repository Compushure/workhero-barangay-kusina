'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { SuperadminLoginForm } from './superadmin-login-form';

interface SuperadminLoginFormWrapperProps {
  onSubmit: (email: string, password: string) => Promise<void>;
}

export function SuperadminLoginFormWrapper({
  onSubmit,
}: SuperadminLoginFormWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;

    gsap.fromTo(
      wrapperRef.current,
      {
        opacity: 0,
        scale: 0.95,
        y: 20,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
      }
    );
  }, []);

  return (
    <div ref={wrapperRef} className="w-full max-w-md px-3 sm:px-0">
      <SuperadminLoginForm onSubmit={onSubmit} />
    </div>
  );
}
