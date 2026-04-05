'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MapOverlay, useMapStore } from './map-overlay';
import { Map } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigationStore } from '../nav-loading-state';

interface MapLauncherProps {
  className?: string;
  inline?: boolean;
}

export function MapLauncher({ className, inline = false }: MapLauncherProps) {
  const { toggleMap, closeMap } = useMapStore();
  const { isNavigating, finishNavigation } = useNavigationStore();
  const pathname = usePathname();
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragOffsets = useRef({ offsetX: 0, offsetY: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hasDragged = useRef(false);

  useEffect(() => {
    finishNavigation();
    closeMap();
  }, [pathname, finishNavigation, closeMap]);

  const clampToViewport = (x: number, y: number) => {
    if (typeof window === 'undefined') return { x, y };
    const padding = 12;
    const width = buttonRef.current?.offsetWidth ?? 68;
    const height = buttonRef.current?.offsetHeight ?? 68;
    const maxX = window.innerWidth - width - padding;
    const maxY = window.innerHeight - height - padding;
    return {
      x: Math.min(Math.max(x, padding), Math.max(padding, maxX)),
      y: Math.min(Math.max(y, padding), Math.max(padding, maxY)),
    };
  };

  const snapToEdge = (coords: { x: number; y: number }) => {
    if (typeof window === 'undefined') return coords;
    const padding = 12;
    const width = buttonRef.current?.offsetWidth ?? 68;
    const isLeft = coords.x + width / 2 < window.innerWidth / 2;
    const snappedX = isLeft ? padding : Math.max(padding, window.innerWidth - width - padding);
    const { y } = clampToViewport(snappedX, coords.y);
    return { x: snappedX, y };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (isNavigating) return;
    event.preventDefault();
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    dragOffsets.current = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
    hasDragged.current = false;
    setDragging(true);
    buttonRef.current.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    if (isNavigating) return;
    event.preventDefault();
    hasDragged.current = true;
    const next = clampToViewport(
      event.clientX - dragOffsets.current.offsetX,
      event.clientY - dragOffsets.current.offsetY
    );
    setPosition(next);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    if (isNavigating) return;
    setPosition((prev) => {
      if (!prev) return prev;
      const clamped = clampToViewport(prev.x, prev.y);
      return snapToEdge(clamped);
    });
    setDragging(false);
    buttonRef.current?.releasePointerCapture(event.pointerId);
  };

  const handleClick = () => {
    if (dragging || hasDragged.current || isNavigating) return;
    toggleMap();
  };

  return (
    <>
      <MapOverlay />
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        title="Click to travel"
        onPointerDown={inline ? undefined : handlePointerDown}
        onPointerMove={inline ? undefined : handlePointerMove}
        onPointerUp={inline ? undefined : handlePointerUp}
        disabled={isNavigating}
        className={cn(
          inline
            ? 'relative z-0 inline-flex size-12 items-center justify-center rounded-full wood-panel text-[#F4B925] hover:text-accent/75 transition-all duration-300 shadow-sm'
            : 'fixed z-55 flex h-17 w-17 items-center justify-center rounded-full wood-panel text-[#F4B925] transition-transform',
          !inline && (position ? '' : 'right-4 top-1/2 -translate-y-1/2'),
          inline
            ? isNavigating
              ? 'cursor-not-allowed opacity-70'
              : 'cursor-pointer hover:scale-103 hover:border-primary/40'
            : dragging
              ? 'cursor-grabbing'
              : isNavigating
                ? 'cursor-not-allowed opacity-70'
                : 'cursor-pointer hover:scale-105',
          className
        )}
        style={!inline && position ? { left: position.x, top: position.y } : undefined}
        aria-label="Open travel map"
        aria-disabled={isNavigating}
      >
        <div className="relative flex items-center justify-center h-full w-full rounded-full">
          {!inline && (
            <span
              className="pointer-events-none absolute inset-0 rounded-full border-2 border-[#47331F] blur-[2px] opacity-75 animate-ping"
              aria-hidden
            />
          )}
          <Map className={inline ? 'size-5 sm:size-6' : 'size-8'} aria-hidden />
        </div>
      </button>
    </>
  );
}
