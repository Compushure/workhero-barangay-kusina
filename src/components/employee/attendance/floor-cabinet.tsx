'use client';

import Image from 'next/image';

interface FloorCabinetProps {
  width?: number;
  height?: number;
}

export function FloorCabinet({ width = 200, height = 240 }: FloorCabinetProps) {
    return (
        <div className="flex justify-center items-center">
          <Image
            src="/floor-cabinet.png"
            alt="Floor Cabinet"
            width={width}
            height={height}
            priority
            className="drop-shadow-lg w-auto h-auto"
          />
        </div>
    );
}