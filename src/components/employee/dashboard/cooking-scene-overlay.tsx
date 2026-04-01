'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { type CookingLaunchPayload } from '@/store/cookingStore';

const AURA_RADIUS_SCALE = 1.15;

type CookingPhase = 'idle' | 'cooking' | 'revealed' | 'serving';

interface DishSlot {
  key: string;
  index: number;
}

interface DishSceneLayout {
  dishSize: string;
  gridGap: string;
  glowSize: string;
  dishGroupOffsetY: string;
}

interface CookingSceneOverlayProps {
  portalTarget: HTMLElement | null;
  trigger: CookingLaunchPayload | null;
  showCookedScene: boolean;
  phase: CookingPhase;
  sceneLayout: DishSceneLayout;
  dishSlots: DishSlot[];
  dishImage: string;
  titleDishName: string;
  overlayTitle: string;
  overlaySubtitle: string;
  shouldShowDishMultiplier: boolean;
  actualOrderCount: number;
  onServe: () => void;
  isServePending: boolean;
}

export function CookingSceneOverlay({
  portalTarget,
  trigger,
  showCookedScene,
  phase,
  sceneLayout,
  dishSlots,
  dishImage,
  titleDishName,
  overlayTitle,
  overlaySubtitle,
  shouldShowDishMultiplier,
  actualOrderCount,
  onServe,
  isServePending,
}: CookingSceneOverlayProps) {
  if (!portalTarget || !trigger) {
    return null;
  }

  return createPortal(
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
                              scale: 0.86,
                              y: -124,
                              rotate: slot.index % 2 === 0 ? -11 : 11,
                              filter: 'blur(3px) brightness(3.1) saturate(0)',
                            }
                          : {
                              opacity: 1,
                              scale: 1,
                              y: [0, -10, 0],
                              rotate: 0,
                              filter: 'blur(0px) brightness(1) saturate(1)',
                            }
                      }
                      transition={{
                        duration: phase === 'serving' ? 0.33 : 0.44,
                        delay:
                          phase === 'serving'
                            ? Math.min(slot.index, 14) * 0.012
                            : 0.14 + Math.min(slot.index, 18) * 0.04,
                        ease: phase === 'serving' ? 'easeIn' : [0.2, 0.75, 0.28, 1],
                        y:
                          phase === 'serving'
                            ? {
                                duration: 0.33,
                                ease: 'easeIn',
                                delay: Math.min(slot.index, 14) * 0.012,
                              }
                            : {
                                duration: 2,
                                ease: 'easeInOut',
                                repeat: Infinity,
                                repeatType: 'loop',
                                delay: 0.5 + Math.min(slot.index, 10) * 0.08,
                              },
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
                            ? { opacity: 1, scale: 0.9, filter: 'blur(10px) brightness(1.9)' }
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
                            ? { opacity: 1, scale: 1.05, filter: 'blur(20px) brightness(2)' }
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
                      <motion.span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-[-16%] rounded-full"
                        style={{
                          background:
                            'radial-gradient(circle, rgba(255,248,206,0.45) 0%, rgba(255,245,190,0.22) 36%, rgba(255,255,255,0) 72%)',
                        }}
                        initial={{ opacity: 0, scale: 0.54, filter: 'blur(20px)' }}
                        animate={
                          phase === 'serving'
                            ? {
                                opacity: 0.96,
                                scale: 0.84,
                                filter: 'blur(24px) brightness(2.5)',
                              }
                            : {
                                opacity: [0.22, 0.46, 0.26],
                                scale: [1, 1.08, 1],
                                filter: ['blur(18px)', 'blur(22px)', 'blur(18px)'],
                              }
                        }
                        transition={
                          phase === 'serving'
                            ? {
                                duration: 0.33,
                                delay: Math.min(slot.index, 14) * 0.012,
                                ease: 'easeIn',
                              }
                            : {
                                duration: 2.8,
                                repeat: Infinity,
                                repeatType: 'loop',
                                ease: 'easeInOut',
                                delay: 0.2 + Math.min(slot.index, 10) * 0.08,
                              }
                        }
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
                    onClick={onServe}
                    disabled={phase !== 'revealed' || isServePending}
                    className="pointer-events-auto h-[3.7rem] min-w-41 rounded-lg border-[3px] border-[#47331F] bg-[#f4bf21] px-7 text-[1.75rem] text-[#2b180b] shadow-[0_0_0_2px_rgba(255,243,193,0.22),0_9px_0_#5a3415] transition-transform hover:-translate-y-0.5 hover:bg-[#ffd34b] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isServePending || phase === 'serving' ? 'Serving...' : 'Serve'}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    portalTarget
  );
}
