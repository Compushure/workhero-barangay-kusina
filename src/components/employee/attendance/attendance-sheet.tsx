'use client';

import Image from 'next/image';
import { HoverMessage } from './hover-message';
import { TimedShake } from './shake-cue';

interface AttendanceSheetProps {
  width?: number;
  height?: number;
}

export function AttendanceSheet({ width = 120, height = 160 }: AttendanceSheetProps) {
  return (
    <HoverMessage message="This is an attendance sheet" position="top" rotation={1}>
      <TimedShake interval={4000} duration={500}>
        <div className="flex justify-center items-center">
          <Image
            src="/attendance-sheet.png"
            alt="Attendance Sheet"
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
