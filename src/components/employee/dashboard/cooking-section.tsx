'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { showDishCookedToast, showDishServedToast } from '@/components/notifications/cooking-toast';
import { useCookingStore } from '@/store/cookingStore';
import { useServeCookedTaskDish } from '@/hooks/tanstack/mutations/employeeTasksMutations';
import { CookingSceneOverlay } from './cooking-scene-overlay';
import { FlameSprite } from './flame-sprite';

type CookingPhase = 'idle' | 'cooking' | 'revealed' | 'serving';

const DEFAULT_DISH_IMAGE = '/assets/dish/food-sinigang.png';
const COOKING_REVEAL_DELAY_MS = 2100;
const SERVE_EXIT_DELAY_MS = 680;
const MAX_VISIBLE_DISHES = 3;

function getDishSceneLayout(orderCount: number) {
  const displayedDishCount = Math.min(MAX_VISIBLE_DISHES, Math.max(1, orderCount));

  if (displayedDishCount === 1) {
    return {
      displayedDishCount,
      dishSize: 'clamp(7.8rem, 14vw, 9rem)',
      gridGap: '0rem',
      glowSize: 'min(84vw, 37rem)',
      dishGroupOffsetY: '2.4rem',
    };
  }

  if (displayedDishCount === 2) {
    return {
      displayedDishCount,
      dishSize: 'clamp(7.1rem, 13vw, 8.2rem)',
      gridGap: '0.45rem',
      glowSize: 'min(84vw, 37rem)',
      dishGroupOffsetY: '2.6rem',
    };
  }

  return {
    displayedDishCount,
    dishSize: 'clamp(6.35rem, 11.5vw, 7.4rem)',
    gridGap: '0.38rem',
    glowSize: 'min(86vw, 38rem)',
    dishGroupOffsetY: '2.8rem',
  };
}

export default function CookingSection({ className = '' }: { className?: string }) {
  const trigger = useCookingStore((state) => state.trigger);
  const triggerVersion = useCookingStore((state) => state.triggerVersion);
  const clearCooking = useCookingStore((state) => state.clearCooking);

  const [phase, setPhase] = useState<CookingPhase>('idle');
  const serveMutation = useServeCookedTaskDish();
  const serveExitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const actualOrderCount = Math.max(1, trigger?.orderCount ?? 1);
  const dishImage = trigger?.dishImageUrl || DEFAULT_DISH_IMAGE;
  const orderLabel = `${actualOrderCount} order${actualOrderCount === 1 ? '' : 's'}`;
  const sceneLayout = useMemo(() => getDishSceneLayout(actualOrderCount), [actualOrderCount]);
  const shouldShowDishMultiplier = actualOrderCount > MAX_VISIBLE_DISHES;

  const dishSlots = useMemo(() => {
    return Array.from({ length: sceneLayout.displayedDishCount }).map((_, index) => ({
      key: `cooked-dish-${index}`,
      index,
    }));
  }, [sceneLayout.displayedDishCount]);

  useEffect(() => {
    if (!trigger) {
      return;
    }

    const cookingTimer = setTimeout(() => {
      setPhase('cooking');
    }, 0);

    const revealTimer = setTimeout(() => {
      setPhase('revealed');
      showDishCookedToast(trigger.orderCount, trigger.dishName);
    }, COOKING_REVEAL_DELAY_MS);

    return () => {
      clearTimeout(cookingTimer);
      clearTimeout(revealTimer);
    };
  }, [trigger, triggerVersion]);

  useEffect(() => {
    return () => {
      if (serveExitTimerRef.current) {
        clearTimeout(serveExitTimerRef.current);
      }
    };
  }, []);

  const handleServe = async () => {
    if (phase !== 'revealed') {
      return;
    }

    if (!trigger?.taskId || serveMutation.isPending) {
      return;
    }

    const currentCooking = trigger;

    setPhase('serving');

    const serveSucceeded = await serveMutation.mutateAsync(currentCooking.taskId);

    if (!serveSucceeded) {
      setPhase('revealed');
      return;
    }

    if (serveExitTimerRef.current) {
      clearTimeout(serveExitTimerRef.current);
    }

    serveExitTimerRef.current = setTimeout(() => {
      const servedOrderCount = currentCooking.orderCount ?? 1;
      const servedDishName = currentCooking.dishName ?? 'Dish';

      showDishServedToast(servedOrderCount, servedDishName);

      setPhase('idle');
      clearCooking();
    }, SERVE_EXIT_DELAY_MS);
  };

  const isCooking = phase === 'cooking';
  const showCookedScene = phase === 'revealed' || phase === 'serving';
  const portalTarget = typeof document !== 'undefined' ? document.body : null;
  const titleDishName = trigger?.dishName || 'Dish';
  const overlayTitle = `You cooked`;
  const overlaySubtitle = `${orderLabel} of ${titleDishName}!`;

  return (
    <Card
      className={`relative isolate flex h-full w-full overflow-visible border-none bg-transparent p-0 shadow-none ${className}`}
    >
      <CardContent className="relative flex h-full w-full items-end justify-center overflow-visible p-4 sm:p-6">
        <motion.div
          animate={
            showCookedScene ? { y: 18, scale: 0.92, opacity: 0.74 } : { y: 0, scale: 1, opacity: 1 }
          }
          transition={{ duration: 0.38, ease: 'easeInOut' }}
          className="relative z-10 overflow-visible"
        >
          {isCooking ? (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[56%] z-0 -translate-x-1/2 -translate-y-1/2"
              animate={{
                opacity: [1, 1, 1],
                scale: [1.08, 1.18, 1.1],
              }}
              transition={{
                duration: 0.95,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'easeInOut',
              }}
            >
              <FlameSprite
                variant="pot"
                scale={9}
                className="drop-shadow-[0_0_28px_rgba(255,144,34,0.8)] -top-8"
              />
            </motion.div>
          ) : null}

          <motion.div
            className="relative z-10 size-52 overflow-visible drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)] sm:size-64"
            animate={
              isCooking
                ? {
                    scale: [1, 1.04, 1],
                    rotate: [0, 0.7, 0, -0.7, 0],
                  }
                : { scale: 1, rotate: 0 }
            }
            transition={
              isCooking
                ? {
                    duration: 1.25,
                    repeat: Infinity,
                    repeatType: 'loop',
                    ease: 'easeInOut',
                  }
                : { duration: 0.2, ease: 'easeOut' }
            }
          >
            <motion.div
              className="absolute inset-0 z-10"
              animate={
                isCooking
                  ? {
                      rotate: [0, 1.4, 0, -1.4, 0],
                    }
                  : { rotate: 0 }
              }
              transition={
                isCooking
                  ? {
                      duration: 1.1,
                      repeat: Infinity,
                      repeatType: 'loop',
                      ease: 'easeInOut',
                    }
                  : { duration: 0.2, ease: 'easeOut' }
              }
            >
              <Image
                src="/assets/kitchen-bg/kitchen-pot.png"
                alt="Kitchen pot"
                fill
                className="object-contain"
                priority
              />
            </motion.div>

            {isCooking ? (
              <>
                <motion.span
                  className="absolute left-10 top-6 z-10 h-4 w-4 rounded-full bg-[#fff4da]/75 blur-[0.5px]"
                  animate={{
                    opacity: [0, 0.8, 0],
                    y: [0, -11, -22],
                    scale: [0.7, 1, 1.18],
                  }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
                />
                <motion.span
                  className="absolute right-10 top-8 z-10 h-3 w-3 rounded-full bg-[#fff4da]/70 blur-[0.5px]"
                  animate={{
                    opacity: [0, 0.78, 0],
                    y: [0, -10, -21],
                    scale: [0.7, 0.98, 1.14],
                  }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: 0.28 }}
                />
                <motion.span
                  className="absolute left-1/2 top-2 z-10 h-5 w-5 -translate-x-1/2 rounded-full bg-[#fff4da]/80 blur-[0.5px]"
                  animate={{
                    opacity: [0, 0.82, 0],
                    y: [0, -12, -24],
                    scale: [0.72, 1.03, 1.2],
                  }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: 0.56 }}
                />
              </>
            ) : null}
          </motion.div>
        </motion.div>
      </CardContent>

      <CookingSceneOverlay
        portalTarget={portalTarget}
        trigger={trigger}
        showCookedScene={showCookedScene}
        phase={phase}
        sceneLayout={sceneLayout}
        dishSlots={dishSlots}
        dishImage={dishImage}
        titleDishName={titleDishName}
        overlayTitle={overlayTitle}
        overlaySubtitle={overlaySubtitle}
        shouldShowDishMultiplier={shouldShowDishMultiplier}
        actualOrderCount={actualOrderCount}
        onServe={handleServe}
        isServePending={serveMutation.isPending}
      />
    </Card>
  );
}
