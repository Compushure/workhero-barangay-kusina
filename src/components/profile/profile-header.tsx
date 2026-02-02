'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileHeaderProps {
  onBack: () => void;
}

export function ProfileHeader({ onBack }: ProfileHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        onClick={onBack}
        className="bg-[#730202] text-white hover:bg-[#8b0003] transition-all duration-200 font-medium active:scale-95"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
    </div>
  );
}
