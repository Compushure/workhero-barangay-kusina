'use client';

import Image from 'next/image';
import { HoverMessage } from './hover-message'; // import the reusable component
import { TimedShake } from './shake-cue'; // import the shake cue component

interface LadleProps {
  width?: number;
  height?: number;
}

export function Ladle({ width = 80, height = 160 }: LadleProps) {
  return (
    <HoverMessage message="This is a wooden ladle" position="bottom-right" rotation={48}>
      <TimedShake interval={3000} duration={500}>
        <div className="flex justify-center items-center">
          <Image
            src="/kitchen-ladle.png"
            alt="Wooden Ladle"
            width={width}
            height={height}
            priority
            className="drop-shadow-md w-auto h-auto cursor-pointer hover:scale-110 transition-transform duration-200"
          />
        </div>
      </TimedShake>
    </HoverMessage>
  );
}
