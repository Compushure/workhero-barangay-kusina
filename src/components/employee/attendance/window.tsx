'use client';

import Image from 'next/image';

interface WindowProps {
  width?: number;
  height?: number;
}

export function Window({ width = 200, height = 240 }: WindowProps) {
    return (
        <div className="flex justify-center items-center">
          <Image
            src="/window.png"
            alt="Window"
            width={width}
            height={height}
            priority
            className="drop-shadow-lg w-auto h-auto"
          />
        </div>
    );
}