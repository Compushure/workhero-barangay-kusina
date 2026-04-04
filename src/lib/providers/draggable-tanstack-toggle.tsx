'use client';

import { useEffect } from 'react';

const STORAGE_KEY = 'tanstack-devtools-toggle-position';
const PADDING = 12;

type Position = { x: number; y: number };

function clampToViewport(x: number, y: number, width: number, height: number): Position {
  const maxX = window.innerWidth - width - PADDING;
  const maxY = window.innerHeight - height - PADDING;

  return {
    x: Math.min(Math.max(x, PADDING), Math.max(PADDING, maxX)),
    y: Math.min(Math.max(y, PADDING), Math.max(PADDING, maxY)),
  };
}

function snapToHorizontalEdge(pos: Position, width: number, height: number): Position {
  const clamped = clampToViewport(pos.x, pos.y, width, height);
  const midX = window.innerWidth / 2;
  const isLeft = clamped.x + width / 2 < midX;
  const snappedX = isLeft ? PADDING : Math.max(PADDING, window.innerWidth - width - PADDING);

  return clampToViewport(snappedX, clamped.y, width, height);
}

function readStoredPosition(): Position | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Position>;
    if (typeof parsed.x !== 'number' || typeof parsed.y !== 'number') return null;
    return { x: parsed.x, y: parsed.y };
  } catch {
    return null;
  }
}

function writeStoredPosition(position: Position) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
  } catch {
    // Ignore storage errors in restricted environments.
  }
}

function applyPosition(container: HTMLDivElement, pos: Position) {
  container.style.position = 'fixed';
  container.style.left = `${pos.x}px`;
  container.style.top = `${pos.y}px`;
  container.style.right = 'auto';
  container.style.bottom = 'auto';
  container.style.transform = 'none';
  container.style.zIndex = '9999';
}

function applyAndPersistPosition(container: HTMLDivElement, pos: Position) {
  applyPosition(container, pos);
  writeStoredPosition(pos);

  // Re-apply in the next frame so our edge snap wins over any same-tick style updates.
  requestAnimationFrame(() => {
    applyPosition(container, pos);
  });
}

export function DraggableTanstackToggle() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const attachDragBehavior = (container: HTMLDivElement) => {
      if (container.dataset.draggableBound === 'true') return;

      const button = container.querySelector('.tsqd-open-btn') as HTMLButtonElement | null;
      if (!button) return;

      container.dataset.draggableBound = 'true';

      const rect = container.getBoundingClientRect();
      const stored = readStoredPosition();
      const initialPos = stored
        ? snapToHorizontalEdge(stored, rect.width, rect.height)
        : snapToHorizontalEdge({ x: rect.left, y: rect.top }, rect.width, rect.height);
      applyPosition(container, initialPos);
      writeStoredPosition(initialPos);

      let dragging = false;
      let moved = false;
      let offsetX = 0;
      let offsetY = 0;
      let activePointerId: number | null = null;

      const finalizeSnap = () => {
        const currentRect = container.getBoundingClientRect();
        const finalPos = clampToViewport(
          currentRect.left,
          currentRect.top,
          currentRect.width,
          currentRect.height
        );
        const snapped = snapToHorizontalEdge(finalPos, currentRect.width, currentRect.height);
        applyAndPersistPosition(container, snapped);
      };

      const onPointerDown = (event: PointerEvent) => {
        event.preventDefault();
        event.stopPropagation();

        const currentRect = container.getBoundingClientRect();
        offsetX = event.clientX - currentRect.left;
        offsetY = event.clientY - currentRect.top;
        moved = false;
        dragging = true;
        activePointerId = event.pointerId;
        try {
          button.setPointerCapture(event.pointerId);
        } catch {
          // Some environments may reject pointer capture; window listeners still handle drag.
        }
      };

      const onWindowPointerMove = (event: PointerEvent) => {
        if (activePointerId !== null && event.pointerId !== activePointerId) return;
        if (!dragging) return;

        const currentRect = container.getBoundingClientRect();
        const next = clampToViewport(
          event.clientX - offsetX,
          event.clientY - offsetY,
          currentRect.width,
          currentRect.height
        );

        moved = true;
        applyPosition(container, next);
      };

      const onWindowPointerUp = (event: PointerEvent) => {
        if (activePointerId !== null && event.pointerId !== activePointerId) return;
        if (!dragging) return;
        dragging = false;
        activePointerId = null;
        try {
          button.releasePointerCapture(event.pointerId);
        } catch {
          // Ignore release failures when capture was not acquired.
        }
        finalizeSnap();
      };

      const onWindowPointerCancel = (event: PointerEvent) => {
        if (activePointerId !== null && event.pointerId !== activePointerId) return;
        if (!dragging) return;
        dragging = false;
        activePointerId = null;
        finalizeSnap();
      };

      const onClickCapture = (event: MouseEvent) => {
        if (!moved) return;
        event.preventDefault();
        event.stopPropagation();
        moved = false;
      };

      const onResize = () => {
        const currentRect = container.getBoundingClientRect();
        const clamped = clampToViewport(
          currentRect.left,
          currentRect.top,
          currentRect.width,
          currentRect.height
        );
        const snapped = snapToHorizontalEdge(clamped, currentRect.width, currentRect.height);
        applyAndPersistPosition(container, snapped);
      };

      button.addEventListener('pointerdown', onPointerDown);
      button.addEventListener('click', onClickCapture, true);
      window.addEventListener('pointermove', onWindowPointerMove);
      window.addEventListener('pointerup', onWindowPointerUp);
      window.addEventListener('pointercancel', onWindowPointerCancel);
      window.addEventListener('resize', onResize);

      container.dataset.draggableCleanup = 'true';
      (container as HTMLDivElement & { __cleanup?: () => void }).__cleanup = () => {
        button.removeEventListener('pointerdown', onPointerDown);
        button.removeEventListener('click', onClickCapture, true);
        window.removeEventListener('pointermove', onWindowPointerMove);
        window.removeEventListener('pointerup', onWindowPointerUp);
        window.removeEventListener('pointercancel', onWindowPointerCancel);
        window.removeEventListener('resize', onResize);
      };
    };

    const observeAndAttach = () => {
      const container = document.querySelector('.tsqd-open-btn-container') as HTMLDivElement | null;
      if (container) {
        attachDragBehavior(container);
      }
    };

    observeAndAttach();

    const observer = new MutationObserver(() => {
      observeAndAttach();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      const containers = document.querySelectorAll('.tsqd-open-btn-container');
      containers.forEach((el) => {
        const cleanup = (el as HTMLDivElement & { __cleanup?: () => void }).__cleanup;
        cleanup?.();
      });
    };
  }, []);

  return null;
}
