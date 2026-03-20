'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileHeaderProps {
  onBack?: () => void;
  isPending?: boolean;
}

export function ProfileHeader({ onBack, isPending: isPendingProp = false }: ProfileHeaderProps) {
  const router = useRouter();
  const [isPendingLocal, startTransition] = useTransition();

  // Use the prop if provided, otherwise fall back to local transition state
  const isPending = isPendingProp || isPendingLocal;

  const handleBack = () => {
    startTransition(() => {
      if (onBack) {
        onBack();
      } else {
        router.back();
      }
    });
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        onClick={handleBack}
        disabled={isPending}
        className="h-8 rounded-lg border border-[#E8943D] bg-[#E07C24] px-3 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#F29F4A] disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:text-sm"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {isPending ? 'Going back...' : 'Back'}
      </Button>
    </div>
  );
}
