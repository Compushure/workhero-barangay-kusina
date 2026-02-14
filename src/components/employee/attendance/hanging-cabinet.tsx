'use client';

import Image from 'next/image';

interface HangingCabinetProps {
  width?: number;
  height?: number;
}

export function HangingCabinet({ width = 200, height = 240 }: HangingCabinetProps) {
    return (
        <div className="flex justify-center items-center">
          <Image
            src="/hanging-cabinet.png"
            alt="Hanging Cabinet"
            width={width}
            height={height}
            priority
            className="drop-shadow-lg w-auto h-auto"
          />
        </div>
    );
}