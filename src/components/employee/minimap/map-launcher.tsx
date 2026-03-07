'use client';

import { MapOverlay, useMapStore } from './map-overlay';
import { Map } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapLauncherProps {
  className?: string;
}

export function MapLauncher({ className }: MapLauncherProps) {
  const { toggleMap } = useMapStore();

  return (
    <>
      <MapOverlay />
      <button
        type="button"
        onClick={toggleMap}
        title="Click to travel"
        className="fixed right-4 top-1/2 -translate-y-1/2 z-[55] flex h-17 w-17 items-center justify-center rounded-full bg-[#6F4C2E] border-3 border-[#47331F] text-[#F4B925] cursor-pointer hover:scale-105 transition-transform shadow-[4px_4px_0px_#000] shadow-[#47331F]/50"
        aria-label="Open travel map"
      >
        <div className="relative flex items-center justify-center h-full w-full rounded-full">
          <span
            className="pointer-events-none absolute inset-0 rounded-full border-2 border-[#47331F] blur-[2px] opacity-75 animate-ping"
            aria-hidden
          />
          <Map className="h-8 w-8" aria-hidden />
        </div>
      </button>
    </>
  );
}
