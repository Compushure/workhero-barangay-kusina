'use client';

import Image from 'next/image';

interface DiningTableProps {
  width?: number;
  height?: number;
}

export function DiningTable({ width = 320, height = 240 }: DiningTableProps) {
  return (
    <div className="flex justify-center items-center">
      <Image
        src="/tables.png"
        alt="Dining Table"
        width={width}
        height={height}
        priority
        className="drop-shadow-lg"
      />
    </div>
  );
}
