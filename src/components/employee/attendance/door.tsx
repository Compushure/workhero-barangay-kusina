'use client';

import Image from 'next/image';
import { HoverMessage } from './hover-message';
import { TimedShake } from './shake-cue';

interface DoorProps {
  width?: number;
  height?: number;
}

export function Door({ width = 200, height = 280 }: DoorProps) {
  return (
    <HoverMessage message="This is a door" position="left">
      <TimedShake interval={5000} duration={500}>
        <div className="flex justify-center items-end">
          <Image
            src="/logout-door.png"
            alt="Door"
            width={width}
            height={height}
            priority
            className="drop-shadow-lg w-auto h-auto cursor-pointer hover:scale-105 transition-transform duration-200"
          />
        </div>
      </TimedShake>
    </HoverMessage>
  );
}
