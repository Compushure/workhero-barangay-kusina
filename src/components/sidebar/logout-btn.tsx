'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition, memo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { handleSignOut } from '@/action-handlers/shared/auth';
import { toast } from 'sonner';
import { useNavigationStore } from '@/store/navigationStore';
import { gsap } from 'gsap';
import { Hand } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const LogOutBtn = memo(function LogOutBtn() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
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
    setConfirmOpen(false);
    startLogout();
    startTransition(async () => {
      try {
        await queryClient.cancelQueries();

        const { error } = await handleSignOut();

        if (error) {
          toast.error('Logout failed', {
            description: error,
          });
          return;
        }

        // Clear all cached queries to prevent data leakage and stop stale protected-page refetches.
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

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        disabled={isPending || isNavigating || isLoggingOut}
        className="w-full cursor-pointer bg-zinc-50 text-primary hover:bg-accent hover:text-zinc-50 py-2 rounded-lg font-semibold shadow-sm/25 transition-all duration-400 ease-in-out text-sm disabled:opacity-60 disabled:cursor-not-allowed"
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

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Confirm logout?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              You are about to sign out of your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              className="bg-primary-gradient text-card hover:bg-primary-gradient hover:brightness-85 cursor-pointer"
              disabled={isPending || isNavigating || isLoggingOut}
            >
              Confirm
            </AlertDialogAction>
            <AlertDialogCancel
              className="!bg-card !text-foreground hover:!bg-[#fafafa] hover:!text-foreground hover:brightness-90 cursor-pointer"
              disabled={isPending || isNavigating || isLoggingOut}
            >
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
