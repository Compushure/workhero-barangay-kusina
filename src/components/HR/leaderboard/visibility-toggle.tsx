'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { toggleRankingVisibility } from '@/actions/hr/leaderboard';

interface VisibilityToggleProps {
  rankLogId: string;
  isVisible: boolean;
}

export default function VisibilityToggle({ rankLogId, isVisible }: VisibilityToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggle = (checked: boolean) => {
    startTransition(async () => {
      const result = await toggleRankingVisibility(rankLogId, checked);
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
      <span className="text-xs text-gray-500">
        {isVisible ? 'Visible' : 'Hidden'}
      </span>
    </div>
  );
}
