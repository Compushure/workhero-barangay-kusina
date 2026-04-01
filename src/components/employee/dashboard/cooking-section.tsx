'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { showDishCookedToast, showDishServedToast } from '@/components/notifications/cooking-toast';
import { useCookingStore } from '@/store/cookingStore';
import { useServeCookedTaskDish } from '@/hooks/tanstack/mutations/employeeTasksMutations';

type CookingPhase = 'idle' | 'cooking' | 'revealed' | 'serving';

const DEFAULT_DISH_IMAGE = '/assets/dish/food-sinigang.png';
const COOKING_REVEAL_DELAY_MS = 2100;
const SERVE_EXIT_DELAY_MS = 680;
const MAX_VISIBLE_DISHES = 3;
const AURA_RADIUS_SCALE = 1.15;

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

  const cookedSceneOverlay =
    portalTarget && trigger
      ? createPortal(
          <AnimatePresence>
            {showCookedScene ? (
              <motion.div
                key="cook-scene-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="fixed inset-0 z-220 h-screen max-h-screen overflow-hidden bg-black/78 backdrop-blur-[2px]"
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(circle at center, rgba(255,246,208,0.16) 0%, rgba(0,0,0,0) 50%)',
                  }}
                />

                <div className="relative flex h-screen max-h-screen w-full items-center justify-center overflow-hidden">
                  <motion.div
                    initial={{ opacity: 0, y: 28, scale: 0.97 }}
                    animate={
                      phase === 'serving'
                        ? { opacity: 0.9, y: 0, scale: 0.985 }
                        : { opacity: 1, y: 0, scale: 1 }
                    }
                    exit={{ opacity: 0, y: 18, scale: 0.98 }}
                    transition={{ duration: 0.32, ease: 'easeOut' }}
                    className="relative h-full w-full max-w-[min(96vw,58rem)] overflow-hidden"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.08 }}
                      className="absolute left-1/2 top-[10%] z-20 w-full max-w-120 -translate-x-1/2 px-4 text-center bg-amber-950/50 py-2 rounded-lg"
                    >
                      <p className="text-[1.25rem] tracking-[0.2em] leading-5 text-[#ffe38a] drop-shadow-[0_1.75px_0_#301705]">
                        {overlayTitle}
                      </p>
                      <h2 className="text-[2rem] text-[#ffd54a] drop-shadow-[0_1.75px_0_#301705]">
                        {overlaySubtitle}
                      </h2>
                    </motion.div>

                    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
                      <motion.div
                        aria-hidden="true"
                        initial={{ opacity: 0, scale: 0.88 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.45, delay: 0.08 }}
                        className="absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{
                          width: sceneLayout.glowSize,
                          height: sceneLayout.glowSize,
                          background:
                            'radial-gradient(circle, rgba(255,250,228,0.72) 0%, rgba(255,232,163,0.38) 34%, rgba(255,255,255,0) 70%)',
                          filter: 'blur(20px)',
                        }}
                      />

                      <motion.div
                        aria-hidden="true"
                        initial={{ opacity: 0, rotate: -8 }}
                        animate={{ opacity: phase === 'serving' ? 0.46 : 0.66, rotate: 360 }}
                        transition={{
                          opacity: { duration: 0.5, delay: 0.08 },
                          rotate: { duration: 32, repeat: Infinity, ease: 'linear' },
                        }}
                        className="absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{
                          width: `calc(${sceneLayout.glowSize} * ${AURA_RADIUS_SCALE})`,
                          height: `calc(${sceneLayout.glowSize} * ${AURA_RADIUS_SCALE})`,
                        }}
                      >
                        <Image
                          src="/assets/light-rays-bg.png"
                          alt=""
                          fill
                          priority
                          sizes="(max-width: 768px) 80vw, 620px"
                          className="pixelated object-contain"
                        />
                      </motion.div>

                      <motion.div
                        aria-hidden="true"
                        initial={{ opacity: 0, rotate: -10 }}
                        animate={{ opacity: phase === 'serving' ? 0.72 : 0.92, rotate: 360 }}
                        transition={{
                          opacity: { duration: 0.35, delay: 0.12 },
                          rotate: { duration: 18, repeat: Infinity, ease: 'linear' },
                        }}
                        className="absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{
                          width: `calc(${sceneLayout.glowSize} * ${AURA_RADIUS_SCALE})`,
                          height: `calc(${sceneLayout.glowSize} * ${AURA_RADIUS_SCALE})`,
                          backgroundImage:
                            'conic-gradient(from 0deg, rgba(255,255,255,0) 0deg, rgba(255,255,255,0.94) 18deg, rgba(255,255,255,0) 34deg, rgba(255,255,255,0) 72deg, rgba(255,248,220,0.82) 88deg, rgba(255,255,255,0) 106deg, rgba(255,255,255,0) 148deg, rgba(255,255,255,0.88) 180deg, rgba(255,255,255,0) 198deg, rgba(255,255,255,0) 236deg, rgba(255,243,201,0.78) 262deg, rgba(255,255,255,0) 280deg, rgba(255,255,255,0) 326deg, rgba(255,255,255,0.76) 344deg, rgba(255,255,255,0) 360deg)',
                          filter: 'blur(2px)',
                          mixBlendMode: 'screen',
                        }}
                      />

                      <div
                        className="relative z-20 flex items-center justify-center"
                        style={{
                          gap: sceneLayout.gridGap,
                          marginTop: sceneLayout.dishGroupOffsetY,
                        }}
                      >
                        {dishSlots.map((slot) => (
                          <motion.div
                            key={slot.key}
                            initial={{ opacity: 0, scale: 0.22, y: 40, filter: 'blur(8px)' }}
                            animate={
                              phase === 'serving'
                                ? {
                                    opacity: 0,
                                    scale: 0.76,
                                    y: -34,
                                    rotate: slot.index % 2 === 0 ? -11 : 11,
                                    filter: 'blur(4px) brightness(1.68) saturate(0.2)',
                                  }
                                : {
                                    opacity: 1,
                                    scale: 1,
                                    y: 0,
                                    rotate: 0,
                                    filter: 'blur(0px) brightness(1) saturate(1)',
                                  }
                            }
                            transition={{
                              duration: phase === 'serving' ? 0.28 : 0.44,
                              delay:
                                phase === 'serving'
                                  ? Math.min(slot.index, 14) * 0.012
                                  : 0.14 + Math.min(slot.index, 18) * 0.04,
                              ease: phase === 'serving' ? 'easeIn' : [0.2, 0.75, 0.28, 1],
                            }}
                            className="relative"
                            style={{
                              width: sceneLayout.dishSize,
                              height: sceneLayout.dishSize,
                            }}
                          >
                            <motion.span
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-[10%] rounded-full bg-white mix-blend-screen"
                              initial={{ opacity: 0.96, scale: 0.58, filter: 'blur(14px)' }}
                              animate={
                                phase === 'serving'
                                  ? { opacity: 0.82, scale: 0.82, filter: 'blur(12px)' }
                                  : {
                                      opacity: [0.96, 0.56, 0.14],
                                      scale: [0.58, 1.08, 1],
                                      filter: ['blur(14px)', 'blur(8px)', 'blur(4px)'],
                                    }
                              }
                              transition={{
                                duration: phase === 'serving' ? 0.28 : 0.5,
                                delay:
                                  phase === 'serving'
                                    ? Math.min(slot.index, 14) * 0.012
                                    : 0.11 + Math.min(slot.index, 16) * 0.03,
                                ease: phase === 'serving' ? 'easeIn' : 'easeOut',
                              }}
                            />
                            <motion.span
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-[4%] rounded-full"
                              style={{
                                background:
                                  'radial-gradient(circle, rgba(255,255,255,0.82) 0%, rgba(255,248,224,0.52) 34%, rgba(255,255,255,0) 74%)',
                              }}
                              initial={{ opacity: 0.92, scale: 0.68, filter: 'blur(16px)' }}
                              animate={
                                phase === 'serving'
                                  ? { opacity: 0.86, scale: 0.92, filter: 'blur(18px)' }
                                  : {
                                      opacity: [0.92, 0.54, 0.2],
                                      scale: [0.68, 1.18, 1],
                                      filter: ['blur(16px)', 'blur(10px)', 'blur(7px)'],
                                    }
                              }
                              transition={{
                                duration: phase === 'serving' ? 0.28 : 0.52,
                                delay:
                                  phase === 'serving'
                                    ? Math.min(slot.index, 14) * 0.012
                                    : 0.13 + Math.min(slot.index, 16) * 0.03,
                                ease: phase === 'serving' ? 'easeIn' : 'easeOut',
                              }}
                            />
                            <Image
                              src={dishImage}
                              alt={titleDishName}
                              fill
                              sizes="(max-width: 640px) 128px, 156px"
                              className="pixelated scale-[1.25] object-contain drop-shadow-[1px_4px_0_rgba(0,0,0,0.46)]"
                            />
                          </motion.div>
                        ))}

                        {shouldShowDishMultiplier ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.86, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.24, delay: 0.28 }}
                            className="absolute -right-20 -top-8 z-30 flex items-center gap-2 rounded-xl wood-panel px-3 py-2 shadow-[0_5px_0_#2d160e]/50"
                          >
                            <div className="relative h-11 w-11 shrink-0">
                              <Image
                                src={dishImage}
                                alt=""
                                fill
                                sizes="48px"
                                className="pixelated object-contain"
                              />
                            </div>
                            <span className="font-pixel text-[1.45rem] leading-none text-[#fff0cb]">
                              x {actualOrderCount}
                            </span>
                          </motion.div>
                        ) : null}
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={
                          phase === 'serving'
                            ? { opacity: 0.86, y: 0, scale: 0.98 }
                            : { opacity: 1, y: 0, scale: 1 }
                        }
                        transition={{ duration: 0.28, delay: 0.18 }}
                        className="absolute bottom-[6%] left-1/2 z-20 -translate-x-1/2"
                      >
                        <Button
                          type="button"
                          onClick={handleServe}
                          disabled={phase !== 'revealed' || serveMutation.isPending}
                          className="pointer-events-auto h-[3.7rem] min-w-41 rounded-lg border-[3px] border-[#47331F] bg-[#f4bf21] px-7 text-[1.75rem] text-[#2b180b] shadow-[0_0_0_2px_rgba(255,243,193,0.22),0_9px_0_#5a3415] transition-transform hover:-translate-y-0.5 hover:bg-[#ffd34b] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {serveMutation.isPending || phase === 'serving' ? 'Serving...' : 'Serve'}
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          portalTarget
        )
      : null;

  return (
    <Card
      className={`relative isolate flex h-full w-full overflow-hidden border-none bg-transparent p-0 shadow-none ${className}`}
    >
      <CardContent className="relative flex h-full w-full items-end justify-center overflow-hidden p-4 sm:p-6">
        <motion.div
          animate={
            showCookedScene ? { y: 18, scale: 0.92, opacity: 0.74 } : { y: 0, scale: 1, opacity: 1 }
          }
          transition={{ duration: 0.38, ease: 'easeInOut' }}
          className="relative z-10"
        >
          <div
            className={`relative h-52 w-52 drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)] sm:h-64 sm:w-64 ${
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
        </motion.div>
      </CardContent>
      {cookedSceneOverlay}
    </Card>
  );
}
