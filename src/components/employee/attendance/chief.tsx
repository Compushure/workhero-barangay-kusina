'use client';

import Image from 'next/image';

interface ChefCharacterProps {
  width?: number;
  height?: number;
}

export function ChefCharacter({ width = 200, height = 280 }: ChefCharacterProps) {
  return (
    <div className="flex justify-center items-end">
      <Image
        src="/chefcook.png"
        alt="Chef Character"
        width={width}
        height={height}
        priority
        className="drop-shadow-lg w-auto h-auto"
      />
    </div>
  );
}
