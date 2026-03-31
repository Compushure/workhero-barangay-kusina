'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { create } from 'zustand';
import { createPortal } from 'react-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useNavigationStore } from '../nav-loading-state';

interface MapState {
  isMapOpen: boolean;
  toggleMap: () => void;
  openMap: () => void;
  closeMap: () => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  isMapOpen: false,
  toggleMap: () => set({ isMapOpen: !get().isMapOpen }),
  openMap: () => set({ isMapOpen: true }),
  closeMap: () => set({ isMapOpen: false }),
}));

const locations: Array<{
  id: string;
  label: string;
  description: string;
  x: number;
  y: number;
  path?: string;
}> = [
  {
    id: 'attendance',
    label: 'Attendance Station',
    description: 'Time in, take breaks, and time out here.',
    path: '/employee/attendance',
    x: 18,
    y: 32,
  },
  {
    id: 'kitchen',
    label: 'Kitchen',
    description: 'This is the main kitchen dashboard for active work.',
    path: '/employee/dashboard',
    x: 50,
    y: 25,
  },
  {
    id: 'mercado',
    label: 'Mercado',
    description: 'Redeem rewards and browse available items here.',
    path: '/employee/mercado',
    x: 78,
    y: 36,
  },
  {
    id: 'tasks',
    label: 'Task Board',
    description: 'View and manage the tasks assigned to you.',
    path: '/employee/tasks',
    x: 35,
    y: 64,
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    description: 'Check the weekly top 10 employee rankings here.',
    path: '/employee/leaderboard',
    x: 79,
    y: 67,
  },
];

function isActiveLocation(pathname: string, path?: string): boolean {
  if (!path) return false;
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function MapOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const { isMapOpen, toggleMap, closeMap } = useMapStore();
  const { isNavigating, startNavigation } = useNavigationStore();
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentLocation = useMemo(
    () => locations.find((location) => isActiveLocation(pathname, location.path)) ?? null,
    [pathname]
  );

  const travelTo = (path: string) => {
    if (!path || isNavigating) return;

    if (pathname === path) {
      closeMap();
      return;
    }

    startNavigation();
    closeMap();
    router.push(path);
  };

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isMapOpen ? (
        <motion.div
          className="fixed inset-0 z-120 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60" onClick={closeMap} />

          <motion.div
            className="relative aspect-square max-h-[90vh] w-[92vw] max-w-175"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Image
              src="/assets/map-bg.png"
              alt="Travel map"
              fill
              sizes="720px"
              className="rounded-2xl object-cover shadow-lg"
              priority
            />

            <button
              type="button"
              onClick={toggleMap}
              disabled={isNavigating}
              className={cn(
                'absolute -top-4 -right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-card shadow-md transition-transform hover:scale-105',
                isNavigating && 'cursor-not-allowed opacity-60 hover:scale-100'
              )}
              aria-label="Close map"
            >
              <X className="h-5 w-5 text-foreground" />
            </button>

            {locations.map((location) => {
              const active = isActiveLocation(pathname, location.path);

              return (
                <div
                  key={location.id}
                  className="absolute"
                  style={{
                    left: `${location.x}%`,
                    top: `${location.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <Tooltip open={activeTooltipId === location.id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        disabled={isNavigating || !location.path}
                        className={cn(
                          'cursor-pointer',
                          (isNavigating || !location.path) && 'cursor-not-allowed opacity-60'
                        )}
                        onClick={() => location.path && travelTo(location.path)}
                        onMouseEnter={() => setActiveTooltipId(location.id)}
                        onMouseLeave={() =>
                          setActiveTooltipId((current) =>
                            current === location.id ? null : current
                          )
                        }
                        onFocus={() => setActiveTooltipId(location.id)}
                        onBlur={() =>
                          setActiveTooltipId((current) =>
                            current === location.id ? null : current
                          )
                        }
                        onPointerDown={() =>
                          setActiveTooltipId((current) =>
                            current === location.id ? null : current
                          )
                        }
                        aria-current={active ? 'page' : undefined}
                        aria-disabled={isNavigating || !location.path}
                      >
                        <div className="relative flex flex-col items-center gap-1.5">
                          {active ? (
                            <span className="rounded-full border-2 border-[#47331F] bg-[#F4B925] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#47331F] shadow-[2px_2px_0px_#47331F]">
                              You are here
                            </span>
                          ) : null}

                          <motion.div
                            style={{ transformOrigin: 'center center' }}
                            whileHover={{ scale: 1.12 }}
                            whileTap={{ scale: 0.96 }}
                            className={cn(
                              'inline-flex items-center rounded-lg border-2 px-4 py-2.5 shadow-[5px_5px_0px_#000] shadow-[#47331F]/50',
                              active
                                ? 'border-[#47331F] bg-[#F4B925]'
                                : 'border-[#47331F] bg-[#E8DBBF]'
                            )}
                          >
                            <span className="whitespace-nowrap text-xs font-semibold text-[#47331F]">
                              {location.label}
                            </span>
                          </motion.div>
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={8} className="z-130">
                      {location.description}
                    </TooltipContent>
                  </Tooltip>
                </div>
              );
            })}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg border-3 border-[#47331F] bg-[#E8DBBF] px-4 py-2.5 text-center shadow-[6px_6px_0px_#000] shadow-[#47331F]/50">
              <p className="text-[13px] font-semibold text-[#47331F]">
                Current stop: {currentLocation?.label ?? 'Unknown location'}
              </p>
              <p className="mt-1 text-[12px] font-semibold text-[#6b5038]">
                Click a location to travel
              </p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
