'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DonateButtonProps {
  onClick?: () => void;
}

/**
 * DonateButton - Client Component
 * Donate button for the dashboard
 */
export function DonateButton({ onClick }: DonateButtonProps) {
  return (
    <Button
      className="gap-2 rounded-full bg-linear-to-r from-pink-300 to-pink-400 px-6 py-2 font-semibold text-pink-900 hover:from-pink-400 hover:to-pink-500"
      onClick={onClick}
    >
      <Heart className="h-5 w-5" />
      DONATE
    </Button>
  );
}
