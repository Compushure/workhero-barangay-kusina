'use client';

import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToggleRankingVisibility } from '@/hooks/tanstack/mutations/hrMutations';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface VisibilityToggleProps {
  rankingPeriodId: string;
  isVisible: boolean;
  disabled?: boolean;
  className?: string;
}

export default function VisibilityToggle({
  rankingPeriodId,
  isVisible,
  disabled = false,
  className,
}: VisibilityToggleProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentVisibility, setCurrentVisibility] = useState(isVisible);
  const [dialogTargetVisibility, setDialogTargetVisibility] = useState<boolean | null>(null);
  const toggleVisibilityMutation = useToggleRankingVisibility();
  const isDisabled = disabled || toggleVisibilityMutation.isPending;
  const statusLabel = currentVisibility ? 'Visible from employee' : 'Hidden from employee';
  const nextVisibility = !currentVisibility;
  const pendingVisibility = dialogTargetVisibility ?? nextVisibility;
  const dialogTitle = pendingVisibility
    ? 'Make ranking visible to employee?'
    : 'Hide ranking from employee?';
  const dialogDescription = pendingVisibility
    ? 'This will allow employees to see the current ranking.'
    : 'This will hide the current ranking from employees until you make it visible again.';
  const confirmLabel = pendingVisibility ? 'Make visible' : 'Hide ranking';

  useEffect(() => {
    setCurrentVisibility(isVisible);
  }, [isVisible, rankingPeriodId]);

  const handleConfirm = () => {
    const previousVisibility = currentVisibility;
    const targetVisibility = dialogTargetVisibility ?? nextVisibility;
    setCurrentVisibility(targetVisibility);

    toggleVisibilityMutation.mutate({
      rankingPeriodId,
      isVisible: targetVisibility,
    }, {
      onError: () => {
        setCurrentVisibility(previousVisibility);
        setDialogTargetVisibility(null);
      },
      onSuccess: () => {
        setDialogTargetVisibility(null);
        setIsDialogOpen(false);
      },
    });
  };

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        if (!toggleVisibilityMutation.isPending) {
          if (!open) {
            setDialogTargetVisibility(null);
          }
          setIsDialogOpen(open);
        }
      }}
    >
      <div className={cn('inline-flex w-full flex-col items-start gap-1.5', className)}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {statusLabel}
        </p>
        <div
          className={cn(
            'control-h flex w-full overflow-hidden rounded-md border border-accent/25 bg-card/75 shadow-sm/25',
            isDisabled ? 'opacity-60' : ''
          )}
          aria-label="Ranking visibility switch"
        >
          <Button
            type="button"
            onClick={() => {
              if (currentVisibility) return;
              setDialogTargetVisibility(true);
              setIsDialogOpen(true);
            }}
            disabled={isDisabled || currentVisibility}
            aria-label="Make visible to employee"
            variant="ghost"
            size="sm"
            className={cn(
              'control-h flex flex-1 items-center justify-center gap-0.5 rounded-none rounded-l-md px-2 text-xs font-semibold whitespace-nowrap transition-all duration-500 ease-in-out disabled:opacity-100 sm:text-sm',
              currentVisibility
                ? 'bg-linear-to-b from-accent-secondary to-accent text-zinc-50 shadow-sm'
                : 'bg-transparent text-secondary opacity-70 shadow-none hover:bg-accent-secondary/15 hover:opacity-100',
              isDisabled
                ? 'cursor-not-allowed hover:bg-transparent'
                : 'hover:cursor-pointer'
            )}
          >
            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Visible
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (!currentVisibility) return;
              setDialogTargetVisibility(false);
              setIsDialogOpen(true);
            }}
            disabled={isDisabled || !currentVisibility}
            aria-label="Hide from employee"
            variant="ghost"
            size="sm"
            className={cn(
              'control-h flex flex-1 items-center justify-center gap-0.5 rounded-none rounded-r-md px-2 text-xs font-semibold whitespace-nowrap transition-all duration-500 ease-in-out disabled:opacity-100 sm:text-sm',
              !currentVisibility
                ? 'bg-linear-to-b from-accent-secondary to-accent text-zinc-50 shadow-sm'
                : 'bg-transparent text-secondary opacity-70 shadow-none hover:bg-accent-secondary/15 hover:opacity-100',
              isDisabled
                ? 'cursor-not-allowed hover:bg-transparent'
                : 'hover:cursor-pointer'
            )}
          >
            <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Hidden
          </Button>
        </div>
      </div>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={toggleVisibilityMutation.isPending}
            className={cn(
              'inline-flex min-h-10 items-center justify-center cursor-pointer  rounded-md px-4 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60',
              pendingVisibility
                ? 'bg-accent hover:bg-accent/70'
                : 'bg-accent-secondary hover:bg-accent-secondary/70'
            )}
          >
            {toggleVisibilityMutation.isPending ? 'Updating...' : confirmLabel}
          </button>
          <button
            type="button"
            onClick={() => setIsDialogOpen(false)}
            disabled={toggleVisibilityMutation.isPending}
            className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md border border-border bg-background-soft px-4 text-sm font-medium text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
