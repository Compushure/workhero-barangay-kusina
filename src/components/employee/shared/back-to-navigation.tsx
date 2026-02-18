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
      variant="ghost"
      className="group flex items-center gap-2 text-[#690003] hover:text-[#690003] hover:bg-[#fbeaea] transition-all"
    >
      <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
      <img
        src="/kitchen.png"
        alt="Kitchen"
        className="w-6 h-6 pixelated group-hover:scale-110 transition-transform"
      />
      <span className="font-medium">{label}</span>
    </Button>
  );
}
