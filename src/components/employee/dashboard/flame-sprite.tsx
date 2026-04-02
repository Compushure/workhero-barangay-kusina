'use client';

import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

const SPRITE_FRAME_SIZE_PX = 32;

type FlameSpriteVariant = 'pot' | 'dishReveal';

const SPRITE_SOURCES: Record<FlameSpriteVariant, string> = {
  pot: '/assets/dish/pot-flame.png',
  dishReveal: '/assets/dish/dish-reveal-flame-full.png',
};

const SPRITE_FRAME_COUNTS: Record<FlameSpriteVariant, number> = {
  pot: 4,
  dishReveal: 8,
};

const SPRITE_ANIMATION_CLASSES: Record<FlameSpriteVariant, string> = {
  pot: 'animate-pot-flame-sprite',
  dishReveal: 'animate-dish-reveal-flame-sprite',
};

function getFlameSpriteStyle(variant: FlameSpriteVariant, scale = 1): CSSProperties {
  const frameCount = SPRITE_FRAME_COUNTS[variant];

  return {
    width: `${SPRITE_FRAME_SIZE_PX}px`,
    height: `${SPRITE_FRAME_SIZE_PX}px`,
    backgroundImage: `url(${SPRITE_SOURCES[variant]})`,
    backgroundSize: `${SPRITE_FRAME_SIZE_PX * frameCount}px ${SPRITE_FRAME_SIZE_PX}px`,
    transform: `scale(${scale})`,
    transformOrigin: 'center',
  };
}

interface FlameSpriteProps {
  variant: FlameSpriteVariant;
  scale?: number;
  className?: string;
  paused?: boolean;
  loop?: boolean;
}

export function FlameSprite({
  variant,
  scale = 1,
  className,
  paused = false,
  loop = true,
}: FlameSpriteProps) {
  const spriteStyle = getFlameSpriteStyle(variant, scale);

  if (!loop) {
    spriteStyle.animationIterationCount = 1;
    spriteStyle.animationFillMode = 'forwards';
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        'flame-sprite-sheet pointer-events-none',
        SPRITE_ANIMATION_CLASSES[variant],
        paused && 'flame-sprite-paused',
        className
      )}
      style={spriteStyle}
    />
  );
}
