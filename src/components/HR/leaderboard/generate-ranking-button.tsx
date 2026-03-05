'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateRanking } from '@/actions/hr/leaderboard';
import type { RankLogPeriodType } from '@/types';

interface GenerateRankingButtonProps {
  periodType: RankLogPeriodType;
  year: number;
  month?: number;
  week?: number;
}

export default function GenerateRankingButton({
  periodType,
  year,
  month,
  week,
}: GenerateRankingButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await generateRanking(periodType, year, month, week);
      if (!result.success || result.data === null) {
        toast.error(result.error ?? 'No ranking data available for this period');
        return;
      }
      if (!result.data.isNew) {
        toast.info('A ranking for this period already exists');
      } else {
        toast.success('Ranking generated successfully');
      }
      router.refresh();
    });
  };

  return (
    <Button
      onClick={handleGenerate}
      disabled={isPending}
      className="bg-[#6D1616] hover:bg-[#5a2a2a] text-white"
    >
      <Sparkles className="w-4 h-4 mr-2" />
      {isPending ? 'Generating…' : 'Generate Ranking'}
    </Button>
  );
}
