'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
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
        toast.success(
          checked ? 'Ranking is now visible to employees' : 'Ranking hidden from employees'
        );
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
        className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-400"
      />
      <span className="text-xs font-medium cursor-default text-gray-600">
        {isVisible
          ? 'Employees can currently see this ranking.'
          : 'Employees cannot see this ranking.'}
      </span>
    </div>
  );
}
