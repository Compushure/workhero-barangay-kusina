'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useTransition, memo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { handleSignOut } from '@/action-handlers/shared/auth';
import { toast } from 'sonner';
import { useNavigationStore } from '@/store/navigationStore';
import { gsap } from 'gsap';
import { Hand } from 'lucide-react';

export const LogOutBtn = memo(function LogOutBtn() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const { isNavigating, isLoggingOut, startLogout, stopLogout } = useNavigationStore();
  const waveRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!isLoggingOut || !waveRef.current) return;

    const tween = gsap.to(waveRef.current, {
      rotate: 18,
      transformOrigin: '70% 70%',
      yoyo: true,
      repeat: -1,
      duration: 0.2,
      ease: 'power1.inOut',
    });

    return () => {
      tween.kill();
    };
  }, [isLoggingOut]);

  const handleLogout = () => {
    if (isNavigating || isLoggingOut) return;
    startLogout();
    startTransition(async () => {
      try {
        const { error } = await handleSignOut();

        if (error) {
          toast.error('Logout failed', { description: error });
          return;
        }

        queryClient.clear();

        toast.success('Logged out', {
          description: 'You have successfully logged out.',
        });

        router.replace('/auth/login');
        router.refresh();
      } finally {
        stopLogout();
      }
    });
  };

  return (
    <div
      onClick={handleLogout}
      className={`cursor-pointer inline-flex items-center justify-center transition-all duration-300 
        ${isPending || isNavigating || isLoggingOut ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'}
      `}
    >
      {isLoggingOut ? (
        <span className="inline-flex items-center gap-2 text-[#690003] font-semibold">
          <span>Goodbye</span>
          <span ref={waveRef} className="inline-flex items-center">
            <Hand className="size-4" />
          </span>
        </span>
      ) : (
        <img
          src="/assets/door1.png"
          alt="Logout door"
          className="w-30 h-30"
        />
      )}
    </div>
  );
});
