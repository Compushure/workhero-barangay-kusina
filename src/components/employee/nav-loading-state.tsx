'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ChefHat } from 'lucide-react';
import { create } from 'zustand';

interface NavigationState {
  isNavigating: boolean;
  startedAt: number | null;
  startNavigation: () => void;
  finishNavigation: () => void;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  isNavigating: false,
  startedAt: null,
  startNavigation: () => {
    const now = performance.now();
    if (get().isNavigating) return;
    set({ isNavigating: true, startedAt: now });
  },
  finishNavigation: () => {
    const { isNavigating, startedAt } = get();
    if (!isNavigating) return;
    const elapsed = startedAt ? performance.now() - startedAt : 0;
    const minDuration = 1000;
    const remaining = Math.max(minDuration - elapsed, 0);
    setTimeout(() => set({ isNavigating: false, startedAt: null }), remaining);
  },
}));

export function NavLoadingState() {
  const pathname = usePathname();
  const lastPathRef = useRef(pathname);
  const { isNavigating, startNavigation, finishNavigation } = useNavigationStore();

  useEffect(() => {
    if (pathname !== lastPathRef.current) {
      finishNavigation();
      lastPathRef.current = pathname;
    }
  }, [pathname, finishNavigation]);

  useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a');
      const href = anchor?.getAttribute('href');
      const targetAttr = anchor?.getAttribute('target');
      if (!anchor || !href) return;
      if (href.startsWith('http') || href.startsWith('//')) return;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (targetAttr && targetAttr === '_blank') return;

      let nextPathname: string | null = null;
      try {
        nextPathname = new URL(href, window.location.origin).pathname;
      } catch (error) {
        nextPathname = null;
      }

      if (!nextPathname) return;
      if (nextPathname === pathname) return;

      startNavigation();
    };

    document.addEventListener('click', handleLinkClick, true);
    return () => document.removeEventListener('click', handleLinkClick, true);
  }, [startNavigation, pathname]);

  return (
    <AnimatePresence>
      {isNavigating ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex items-center gap-4 rounded-2xl bg-[#F6E6C9] border-3 border-[#47331F] px-7 py-5 shadow-[8px_8px_0px_#000] text-[#47331F]"
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            aria-live="assertive"
          >
            <motion.div
              className="relative h-16 w-16 text-[#47331F]"
              animate={{ rotate: [-6, 6, -6], scale: [0.98, 1.02, 0.98] }}
              transition={{ repeat: Infinity, duration: 1.0, ease: 'easeInOut' }}
            >
              <ChefHat className="h-full w-full" strokeWidth={2.5} />
            </motion.div>
            <div className="flex flex-col font-pixel gap-1">
              <div className="text-base font-semibold">Chef is about to travel...</div>
              <div className="text-sm text-[#6B4A2B]">It won't be long!</div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
