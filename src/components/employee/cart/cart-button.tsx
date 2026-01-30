'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { Badge } from '@/components/ui/badge';

interface CartButtonProps {
  variant?: 'floating' | 'inline';
  className?: string;
}

export function CartButton({ variant = 'floating', className = '' }: CartButtonProps) {
  const { items, setIsOpen, getTotalItems } = useCartStore();
  const totalItems = getTotalItems();
  const hasItems = items.length > 0;

  if (variant === 'floating') {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#690003] hover:bg-[#8b0000] shadow-lg z-40 ${className}`}
        size="icon"
      >
        <div className="relative">
          <ShoppingCart className="h-6 w-6" />
          {hasItems && (
            <Badge className="absolute -top-3 -right-3 h-5 min-w-5 flex items-center justify-center p-0 bg-yellow-500 text-[#690003] text-xs font-bold border-2 border-white">
              {totalItems > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : totalItems}
            </Badge>
          )}
        </div>
      </Button>
    );
  }

  // Inline variant
  return (
    <Button
      onClick={() => setIsOpen(true)}
      variant="outline"
      className={`border-[#690003] text-[#690003] hover:bg-[#fbeaea] ${className}`}
    >
      <div className="relative flex items-center gap-2">
        <ShoppingCart className="h-4 w-4" />
        <span>Cart</span>
        {hasItems && (
          <Badge className="bg-[#690003] text-white text-xs px-1.5 py-0.5">
            {totalItems > 99 ? '99+' : totalItems}
          </Badge>
        )}
      </div>
    </Button>
  );
}
