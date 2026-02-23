'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackToNavigationProps {
  href?: string;
  label?: string;
}

export function BackToNavigation({
  href = '/employee/dashboard',
  label = 'Back to Kitchen',
}: BackToNavigationProps) {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push(href)}
      className="group flex items-center gap-3 bg-[#8b5a3c] hover:bg-[#a67c52] text-amber-50 border-4 border-[#5d3a26] shadow-lg font-black px-6 py-6 transition-transform hover:scale-105"
      style={{ fontFamily: 'monospace', imageRendering: 'pixelated' }}
    >
      <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
      <img
        src="/kitchen.png"
        alt="Kitchen"
        className="w-8 h-8 group-hover:scale-110 transition-transform"
        style={{ imageRendering: 'pixelated' }}
      />
      <span className="text-base">{label.toUpperCase()}</span>
    </Button>
  );
}
