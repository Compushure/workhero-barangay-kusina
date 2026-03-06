'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toggleRankingVisibility } from '@/actions/hr/leaderboard';

interface VisibilityToggleProps {
  rankingPeriodId: string;
  isVisible: boolean;
}

export default function VisibilityToggle({ rankingPeriodId, isVisible }: VisibilityToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggle = (checked: boolean) => {
    startTransition(async () => {
      const result = await toggleRankingVisibility(rankingPeriodId, checked);
      if (result.success) {
        toast.success(checked ? 'Ranking is now visible to employees' : 'Ranking hidden from employees');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isVisible}
        onCheckedChange={handleToggle}
        disabled={isPending}
        size="sm"
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-xs text-gray-500 cursor-help">
            {isVisible ? 'Visible' : 'Hidden'}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          {isVisible
            ? 'Employees can currently see this ranking on their leaderboard.'
            : 'Employees cannot see this ranking on their leaderboard.'}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
