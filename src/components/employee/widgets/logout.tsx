'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useTransition, memo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { handleSignOut } from '@/action-handlers/shared/auth';
import { toast } from 'sonner';
import { useNavigationStore } from '@/store/navigationStore';
import { gsap } from 'gsap';
import { Hand, DoorOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface LogOutBtnProps {
  iconOnly?: boolean;
  requireConfirmation?: boolean;
  className?: string;
}

export const LogOutBtn = memo(function LogOutBtn({
  iconOnly = false,
  requireConfirmation = false,
  className,
}: LogOutBtnProps) {
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

  const isDisabled = isPending || isNavigating || isLoggingOut;
  const triggerAction = requireConfirmation ? undefined : handleLogout;

  const buttonContent = isLoggingOut ? (
    <span
      ref={waveRef}
      className={cn(
        'inline-flex items-center',
        iconOnly ? 'text-accent-secondary' : 'text-[#690003]'
      )}
    >
      <Hand className={iconOnly ? 'size-4.5' : 'size-6'} />
    </span>
  ) : (
    <DoorOpen className={iconOnly ? 'size-6 object-contain text-card group-hover:text-accent-secondary transition-all duration-300' : 'w-full h-full object-contain'}/>
  );

  const triggerButton = iconOnly ? (
    <button
      type="button"
      onClick={triggerAction}
      aria-label={isLoggingOut ? 'Logging out' : 'Logout'}
      disabled={isDisabled}
      className={cn(
        'group size-12 rounded-full inline-flex items-center justify-center transition-all duration-300 shadow-sm',
        isDisabled
          ? 'opacity-60 cursor-not-allowed'
          : 'cursor-pointer hover:scale-103 hover:border-primary/40',
        className
      )}
    >
      {buttonContent}
    </button>
  ) : (
    <button
      type="button"
      onClick={triggerAction}
      aria-label={isLoggingOut ? 'Logging out' : 'Logout'}
      disabled={isDisabled}
      className={cn(
        `inline-flex items-center rounded-lg p-2 text-left transition-all duration-300 
        ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`,
        className
      )}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#E89C30] border-2 border-[#47331F] shrink-0 mr-3 overflow-hidden">
        {buttonContent}
      </div>

      <div className="flex flex-col">
        {isLoggingOut ? (
          <span className="text-xl font-jersey text-[#F5E8D6]">Goodbye</span>
        ) : (
          <span className="text-xl font-jersey text-[#F5E8D6]">Logout</span>
        )}
      </div>
    </button>
  );

  if (!requireConfirmation) {
    return triggerButton;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="wood-panel border border-card/20 text-card" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="font-jersey text-2xl tracking-wide text-accent-secondary">
            Confirm Logout
          </DialogTitle>
          <DialogDescription className="text-sm text-card/80">
            You are about to end your session. Are you sure you want to logout?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              className="font-jersey w-27 bg-[#D18C23] hover:bg-[#a56b1b] text-primary border-2 border-primary"
              variant='outline'
              onClick={handleLogout}
              disabled={isDisabled}
            >
              Logout
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="outline" className="font-jersey text-primary bg-parchment w-27 border-2 border-primary">
              Stay
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
