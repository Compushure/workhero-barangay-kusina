'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { create } from 'zustand';
import { createPortal } from 'react-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
  name: string;
  x: number;
  y: number;
  path?: string;
}> = [
  {
    id: 'attendance',
    label: '⏰ Attendance Station',
    name: 'This is where you time in, take breaks, and time out.',
    path: '/employee/attendance',
    x: 18,
    y: 32,
  },
  {
    id: 'kitchen',
    label: '🍲 Kitchen',
    name: 'This is where you do your tasks.',
    path: '/employee/dashboard',
    x: 50,
    y: 25,
  },
  {
    id: 'mercado',
    label: '🏪 Mercado',
    name: 'This is where you can find various items for redemption.',
    path: '/employee/mercado',
    x: 78,
    y: 36,
  },
  {
    id: 'tasks',
    label: '📋 Task Board',
    name: 'This is where you can view and manage your tasks.',
    path: '/employee/tasks',
    x: 35,
    y: 64,
  },
  {
    id: 'leaderboard',
    label: '🏆 Leaderboard',
    name: 'This is where you can see the weekly top 10 ranking.',
    path: '/employee/leaderboard',
    x: 79,
    y: 67,
  },
];

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
            className="relative w-[92vw] max-w-175 max-h-[90vh] aspect-square"
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
              className="object-cover rounded-2xl shadow-lg"
              priority
            />

            <button
              type="button"
              onClick={toggleMap}
              disabled={isNavigating}
              className={`absolute -top-4 -right-4 bg-card rounded-full w-11 h-11 flex items-center justify-center z-10 shadow-md hover:scale-105 transition-transform ${isNavigating ? 'opacity-60 cursor-not-allowed hover:scale-100' : ''}`}
              aria-label="Close map"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>

            {locations.map((loc) => (
              <div
                key={loc.id}
                className="absolute"
                style={{ left: `${loc.x}%`, top: `${loc.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                <Tooltip open={activeTooltipId === loc.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      disabled={isNavigating || !loc.path}
                      className={`cursor-pointer ${isNavigating || !loc.path ? 'opacity-60 cursor-not-allowed' : ''}`}
                      onClick={() => loc.path && travelTo(loc.path)}
                      onMouseEnter={() => setActiveTooltipId(loc.id)}
                      onMouseLeave={() =>
                        setActiveTooltipId((current) => (current === loc.id ? null : current))
                      }
                      onFocus={() => setActiveTooltipId(loc.id)}
                      onBlur={() =>
                        setActiveTooltipId((current) => (current === loc.id ? null : current))
                      }
                      onPointerDown={() =>
                        setActiveTooltipId((current) => (current === loc.id ? null : current))
                      }
                      aria-disabled={isNavigating || !loc.path}
                    >
                      <motion.div
                        style={{ transformOrigin: 'center center' }}
                        whileHover={{ scale: 1.12 }}
                        whileTap={{ scale: 0.96 }}
                        className="inline-flex items-center bg-[#E8DBBF] border-2 border-[#47331F] rounded-lg shadow-[5px_5px_0px_#000] shadow-[#47331F]/50 px-4 py-2.5"
                      >
                        <span className="text-[12px] font-semibold text-[#47331F] whitespace-nowrap">
                          {loc.label}
                        </span>
                      </motion.div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={8} className="z-130">
                    {loc.name}
                  </TooltipContent>
                </Tooltip>
              </div>
            ))}

            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[14px] font-semibold text-[#47331F] bg-[#E8DBBF] border-3 border-[#47331F] rounded-lg shadow-[6px_6px_0px_#000] shadow-[#47331F]/50 px-4 py-2.5">
              🗺️ Click a location to travel
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
