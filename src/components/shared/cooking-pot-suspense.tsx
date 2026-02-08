import { CookingPot } from 'lucide-react';

interface CookingPotSuspenseProps {
  label?: string;
}

export function CookingPotSuspense({ label = 'Loading...' }: CookingPotSuspenseProps) {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <CookingPot className="animate-bounce size-10 text-[#690003]" />
        <span className="text-sm text-gray-700">{label}</span>
      </div>
    </div>
  );
}
