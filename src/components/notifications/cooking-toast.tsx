'use client';

import { CheckCircle2, CookingPot, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CookingToastContentProps {
  toastId: string | number;
  type: 'cooked' | 'served';
  orderCount: number;
  dishName: string;
}

const COOKING_TOAST_OPTIONS = {
  duration: 7000,
  className: '!w-auto !max-w-none !p-0 !bg-transparent !border-0 !shadow-none',
  style: {
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    padding: 0,
  },
} as const;

function CookingToastContent({ toastId, type, orderCount, dishName }: CookingToastContentProps) {
  const isCooked = type === 'cooked';
  const Icon = isCooked ? CookingPot : CheckCircle2;
  const cardClass = isCooked ? 'border-accent' : 'border-green-400';
  const iconClass = isCooked ? 'text-accent' : 'text-green-300';
  const orderLabel = `${orderCount} order${orderCount === 1 ? '' : 's'}`;
  const title = isCooked ? 'dish' : 'serve';
  const message = isCooked
    ? `Congrats! You have finished making ${orderLabel} of ${dishName}. Ready to serve!`
    : `Great service! You have served ${orderLabel} of ${dishName}.`;

  return (
    <div className="w-100 max-w-[calc(100vw-2rem)]">
      <div className={cn('rounded-xl border-2 p-4 shadow-xl bg-wood-card text-card', cardClass)}>
        <div className="flex items-start gap-3">
          <div className={cn('mt-0.5 p-1.5 rounded-md bg-yellow-500/15 shadow-sm/25', iconClass)}>
            <Icon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[0.75rem] font-bold uppercase tracking-wide opacity-80">{title}</p>
            <p className="mt-0.5 text-sm leading-snug">{message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(toastId)}
            className="rounded-md p-1 opacity-70 transition hover:bg-black/10 hover:opacity-100"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function showDishCookedToast(orderCount: number, dishName: string): void {
  toast.custom(
    (id) => (
      <CookingToastContent
        toastId={id}
        type="cooked"
        orderCount={Math.max(1, orderCount)}
        dishName={dishName || 'Dish'}
      />
    ),
    COOKING_TOAST_OPTIONS
  );
}

export function showDishServedToast(orderCount: number, dishName: string): void {
  toast.custom(
    (id) => (
      <CookingToastContent
        toastId={id}
        type="served"
        orderCount={Math.max(1, orderCount)}
        dishName={dishName || 'Dish'}
      />
    ),
    COOKING_TOAST_OPTIONS
  );
}
