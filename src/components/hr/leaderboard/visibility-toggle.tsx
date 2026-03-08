'use client';

import { useTransition } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { toggleRankingVisibility } from '@/actions/hr/leaderboard';
import { hrLeaderboardKeys } from '@/hooks/tanstack/queries/hrQueries';

interface VisibilityToggleProps {
  rankingPeriodId: string;
  isVisible: boolean;
}

export default function VisibilityToggle({ rankingPeriodId, isVisible }: VisibilityToggleProps) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await toggleRankingVisibility(rankingPeriodId, !isVisible);
      if (result.success) {
        toast.success(
          !isVisible ? 'Ranking is now visible to employees' : 'Ranking hidden from employees'
        );
        await queryClient.invalidateQueries({ queryKey: hrLeaderboardKeys.all });
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={[
        'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isVisible
          ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-300'
          : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:border-gray-300',
      ].join(' ')}
    >
      {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      {isVisible ? 'Visible to employee' : 'Hidden from employee'}
    </button>
  );
}
