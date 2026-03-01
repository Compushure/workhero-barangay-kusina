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
          toast.error('Logout failed', {
            description: error,
          });
          return;
        }

        // Clear all cached queries to prevent data leakage between users
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
    <button
      onClick={handleLogout}
      disabled={isPending || isNavigating || isLoggingOut}
      className="w-full cursor-pointer bg-white text-foreground py-2 rounded-full font-semibold hover:bg-gray-100 transition-all duration-500 ease-in-out text-sm disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isLoggingOut ? (
        <span className="inline-flex items-center gap-2">
          <span>Goodbye</span>
          <span ref={waveRef} className="inline-flex items-center">
            <Hand className="size-4" />
          </span>
        </span>
      ) : (
        'Logout'
      )}
    </button>
  );
});
