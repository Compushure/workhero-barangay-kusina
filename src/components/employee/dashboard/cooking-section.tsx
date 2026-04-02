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
const COOKING_BUBBLE_COUNT = 16;

interface CookingBubbleSpec {
  id: string;
  leftPercent: number;
  topPercent: number;
  sizeRem: number;
  rise: number;
  xDrift: number;
  startScale: number;
  midScale: number;
  endScale: number;
  maxOpacity: number;
  duration: number;
  delay: number;
  repeatDelay: number;
  glowRadius: number;
  glowOpacity: number;
}

function createSeededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildCookingBubbleSpecs(count: number): CookingBubbleSpec[] {
  const random = createSeededRandom(20260402);

  return Array.from({ length: count }, (_, index) => {
    const sizeRem = 0.75 + random() * 0.65;
    const duration = 1.25 + random() * 0.95;

    return {
      id: `cooking-bubble-${index}`,
      leftPercent: 6 + random() * 88,
      topPercent: 0 + random() * 26,
      sizeRem,
      rise: 12 + random() * 40,
      xDrift: -7 + random() * 18,
      startScale: 0.62 + random() * 0.25,
      midScale: 0.92 + random() * 0.2,
      endScale: 1.08 + random() * 0.22,
      maxOpacity: 0.84 + random() * 0.16,
      duration,
      delay: random() * 0.95,
      repeatDelay: random() * 0.3,
      glowRadius: 7 + random() * 7,
      glowOpacity: 0.58 + random() * 0.3,
    };
  });
}

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
  const cookingBubbleSpecs = useMemo(() => buildCookingBubbleSpecs(COOKING_BUBBLE_COUNT), []);

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
              className="pointer-events-none absolute left-1/2 top-[45%] z-0 -translate-x-1/2 -translate-y-1/2"
              animate={{
                scale: [1.08, 1.18, 1.1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'easeInOut',
              }}
            >
              <FlameSprite
                variant="pot"
                scale={9}
                className="filter-[brightness(1.24)_saturate(1.18)_contrast(1.08)_drop-shadow(0_0_12px_rgba(255,215,130,0.9))_drop-shadow(0_0_20px_rgba(245,135,35,0.62))]"
              />
            </motion.div>
          ) : null}

          <motion.div
            className="relative z-10 size-52 overflow-visible sm:size-64"
            style={
              isCooking ? {
              filter:
                'drop-shadow(0 8px 16px rgba(0,0,0,0.45)) drop-shadow(0 0 16px rgba(255,204,110,0.65)) drop-shadow(0 0 20px rgba(244,120,18,0.5))',
            } : null}
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

            {isCooking
              ? cookingBubbleSpecs.map((bubble) => (
                  <motion.span
                    key={bubble.id}
                    className="absolute z-30 rounded-full bg-[#fff8df]/95 blur-[0.35px]"
                    style={{
                      left: `${bubble.leftPercent}%`,
                      top: `${bubble.topPercent}%`,
                      width: `${bubble.sizeRem}rem`,
                      height: `${bubble.sizeRem}rem`,
                      boxShadow: `0 0 ${bubble.glowRadius}px rgba(255, 246, 210, ${bubble.glowOpacity})`,
                    }}
                    animate={{
                      opacity: [0, bubble.maxOpacity, 0],
                      y: [0, -bubble.rise * 0.55, -bubble.rise],
                      x: [0, bubble.xDrift, 0],
                      scale: [bubble.startScale, bubble.midScale, bubble.endScale],
                    }}
                    transition={{
                      duration: bubble.duration,
                      repeat: Infinity,
                      repeatType: 'loop',
                      repeatDelay: bubble.repeatDelay,
                      ease: 'easeInOut',
                      delay: bubble.delay,
                    }}
                  />
                ))
              : null}
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
