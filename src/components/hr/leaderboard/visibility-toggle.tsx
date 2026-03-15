'use client';

import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToggleRankingVisibility } from '@/hooks/tanstack/mutations/hrMutations';

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
  const toggleVisibilityMutation = useToggleRankingVisibility();

  const handleClick = () => {
    toggleVisibilityMutation.mutate({
      rankingPeriodId,
      isVisible: !isVisible,
    });
  };

  const variantClasses = isVisible
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300'
    : 'border-border bg-background text-muted-foreground hover:text-foreground hover:border-accent/40';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || toggleVisibilityMutation.isPending}
      className={cn(
        'control-h inline-flex items-center gap-2 rounded-full border px-3 text-sm font-semibold shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses,
        className
      )}
    >
      {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      {isVisible ? 'Visible to employee' : 'Hidden from employee'}
    </button>
  );
}
