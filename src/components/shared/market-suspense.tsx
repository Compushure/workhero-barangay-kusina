import { ShoppingBasket } from 'lucide-react';

interface MarketSuspenseProps {
  label?: string;
}

export function MarketSuspense({ label = 'Loading...' }: MarketSuspenseProps) {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <ShoppingBasket className="animate-bounce size-10 text-[#690003]" />
        <span className="text-sm text-gray-700">{label}</span>
      </div>
    </div>
  );
}
