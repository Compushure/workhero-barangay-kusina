'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useTransition, memo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { handleSignOut } from '@/action-handlers/shared/auth';
import { toast } from 'sonner';
import { useNavigationStore } from '@/store/navigationStore';
import { gsap } from 'gsap';
import { Hand } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogOutBtnProps {
  iconOnly?: boolean;
  className?: string;
}

export const LogOutBtn = memo(function LogOutBtn({ iconOnly = false, className }: LogOutBtnProps) {
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
        await queryClient.cancelQueries();

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
      } finally {
        stopLogout();
      }
    });
  };

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        aria-label={isLoggingOut ? 'Logging out' : 'Logout'}
        disabled={isPending || isNavigating || isLoggingOut}
        className={cn(
          'size-12 rounded-full inline-flex items-center justify-center transition-all duration-300 shadow-sm',
          isPending || isNavigating || isLoggingOut
            ? 'opacity-60 cursor-not-allowed'
            : 'cursor-pointer hover:scale-103 hover:border-primary/40',
          className
        )}
      >
        {isLoggingOut ? (
          <span ref={waveRef} className="inline-flex items-center text-accent-secondary">
            <Hand className="size-4.5" />
          </span>
        ) : (
          <img src="/assets/door.png" alt="Logout" className="size-4 object-contain" />
        )}
      </button>
    );
  }

  return (
    <div
      onClick={handleLogout}
      className={cn(
        `inline-flex items-center rounded-lg p-2 cursor-pointer transition-all duration-300 
        ${isPending || isNavigating || isLoggingOut ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'}`,
        className
      )}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#E89C30] border-2 border-[#47331F] shrink-0 mr-3 overflow-hidden">
        {isLoggingOut ? (
          <span ref={waveRef} className="inline-flex items-center text-[#690003]">
            <Hand className="size-6" />
          </span>
        ) : (
          <img src="/assets/door.png" alt="Logout door" className="w-full h-full object-contain" />
        )}
      </div>

      <div className="flex flex-col">
        {isLoggingOut ? (
          <span className="text-xl font-jersey text-[#F5E8D6]">Goodbye</span>
        ) : (
          <span className="text-xl font-jersey text-[#F5E8D6]">Logout</span>
        )}
      </div>
    </div>
  );
});
