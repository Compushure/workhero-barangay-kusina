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
        className="bg-[#730202] text-white hover:bg-[#8b0003] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition-all duration-200 font-medium"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {isPending ? 'Going back...' : 'Back'}
      </Button>
    </div>
  );
}
