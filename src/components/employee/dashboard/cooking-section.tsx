'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { showDishCookedToast, showDishServedToast } from '@/components/notifications/cooking-toast';
import { useCookingStore } from '@/store/cookingStore';
import { useServeCookedTaskDish } from '@/hooks/tanstack/mutations/employeeTasksMutations';

type CookingPhase = 'idle' | 'cooking' | 'revealed' | 'serving';

const DEFAULT_DISH_IMAGE = '/assets/dish/food-sinigang.png';

export default function CookingSection({ className = '' }: { className?: string }) {
  const trigger = useCookingStore((state) => state.trigger);
  const triggerVersion = useCookingStore((state) => state.triggerVersion);
  const clearCooking = useCookingStore((state) => state.clearCooking);

  const [phase, setPhase] = useState<CookingPhase>('idle');
  const [activeCooking, setActiveCooking] = useState<typeof trigger>(null);
  const serveMutation = useServeCookedTaskDish();

  const dishCount = Math.max(1, activeCooking?.orderCount ?? 3);
  const dishImage = activeCooking?.dishImageUrl || DEFAULT_DISH_IMAGE;

  const dishSlots = useMemo(() => {
    return Array.from({ length: dishCount }).map((_, index) => ({
      key: `cooked-dish-${index}`,
      delayMs: Math.min(index, 8) * 70,
    }));
  }, [dishCount]);

  useEffect(() => {
    if (!trigger) {
      return;
    }

    setActiveCooking(trigger);
    setPhase('cooking');

    const revealTimer = setTimeout(() => {
      setPhase('revealed');

      showDishCookedToast(trigger.orderCount, trigger.dishName);
    }, 2100);

    return () => {
      clearTimeout(revealTimer);
    };
  }, [trigger, triggerVersion]);

  const handleServe = async () => {
    if (phase !== 'revealed') {
      return;
    }

    if (!activeCooking?.taskId || serveMutation.isPending) {
      return;
    }

    setPhase('serving');

    const serveSucceeded = await serveMutation.mutateAsync(activeCooking.taskId);

    if (!serveSucceeded) {
      setPhase('revealed');
      return;
    }

    setTimeout(() => {
      const servedOrderCount = activeCooking?.orderCount ?? 1;
      const servedDishName = activeCooking?.dishName ?? 'Dish';

      showDishServedToast(servedOrderCount, servedDishName);

      setPhase('idle');
      setActiveCooking(null);
      clearCooking();
    }, 620);
  };

  const isCooking = phase === 'cooking';
  const showCookedDishes = phase === 'revealed' || phase === 'serving';

  return (
    <Card
      className={`bg-transparent shadow-none border-none flex flex-col items-center gap-6 p-6 relative z-20 ${className}`}
    >
      <CardContent className="flex flex-col items-center gap-6 flex-1 justify-center w-full">
        <div className="relative z-30 flex min-h-18 w-full items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {showCookedDishes
            ? dishSlots.map((slot) => (
                <div
                  key={slot.key}
                  className={`poof-appear relative size-15 sm:size-18 rounded-lg p-1 shadow-md ${phase === 'serving' ? 'serve-away' : ''}`}
                  style={{ animationDelay: `${slot.delayMs}ms` }}
                >
                  <Image
                    src={dishImage}
                    alt={activeCooking?.dishName || 'Cooked dish'}
                    fill
                    className="object-contain p-1"
                  />
                </div>
              ))
            : Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`dish-placeholder-${index}`}
                  className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-lg border-2 border-[#47331F]/45 bg-[#F5E7CF]/60 p-1 shadow-md opacity-65"
                >
                  <Image
                    src={DEFAULT_DISH_IMAGE}
                    alt="Dish placeholder"
                    fill
                    className="object-contain p-1"
                  />
                </div>
              ))}

          {phase === 'revealed' ? (
            <Button
              type="button"
              onClick={handleServe}
              disabled={serveMutation.isPending}
              className="relative z-40 pointer-events-auto h-10 px-4 font-pixel text-[13px] border-2 border-[#47331F] bg-[#6a3f29] text-[#f5ebd8] shadow-[3px_3px_0px_#3f2518] hover:bg-[#7b4b32]"
            >
              {serveMutation.isPending ? 'Serving...' : 'Serve'}
            </Button>
          ) : null}
        </div>

        <div className="w-full flex justify-center">
          <div
            className={`relative w-52 h-52 sm:w-64 sm:h-64 drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)] ${
              isCooking ? 'glow-pulse cooking-pot-pop' : ''
            }`}
          >
            <Image
              src="/assets/kitchen-bg/kitchen-pot.png"
              alt="Kitchen pot"
              fill
              className={`object-contain ${isCooking ? 'pot-swirl' : ''}`}
              priority
            />

            {isCooking ? (
              <>
                <span className="steam-puff absolute left-10 top-6 h-4 w-4 rounded-full bg-[#fff4da]/75" />
                <span className="steam-puff absolute right-10 top-8 h-3 w-3 rounded-full bg-[#fff4da]/70" />
                <span className="steam-puff absolute left-1/2 top-2 h-5 w-5 -translate-x-1/2 rounded-full bg-[#fff4da]/80" />
              </>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
