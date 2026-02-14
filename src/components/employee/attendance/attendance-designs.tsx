// app/attendance/AttendanceDesign.tsx
'use client';
import { Press_Start_2P } from 'next/font/google';

const pressStart2P = Press_Start_2P({
  weight: '400', // only one weight available
  subsets: ['latin'],
});

import AttendanceIcon from './attendance';

export default function AttendanceDesign() {
  return (
    <div
      className={`flex min-h-screen items-center justify-center bg-cover bg-center pixelated ${pressStart2P.className}`}
      style={{ backgroundImage: "url('/bgbg.jpg')" }} // image in public folder
      // className={`flex min-h-screen items-center justify-center bg-[#6b2d00] pixelated ${pressStart2P.className}`}
    >
      <div className="relative flex flex-col items-center">
        {/* Overlapping header box */}
        <div
          className="absolute -top-10 px-6 py-6
                        border-4 border-black bg-orange-300
                        shadow-[6px_6px_0px_#000] animate-fadeIn text-center"
        >
          <h2 className="text-base text-black">ATTENDANCE MENU</h2>
        </div>

        {/* Main panel */}
        <div
          className="p-6 border-4 border-black bg-orange-200
                        shadow-[6px_6px_0px_#000] animate-fadeIn flex flex-col items-center"
        >
          {/* Import the functional AttendanceIcon */}
          <AttendanceIcon />

          {/* Decorative footer */}
          <p className="text-xs text-center mt-8 animate-fadeUp">
            Stay on track with your work hours.
          </p>
        </div>
      </div>
    </div>
  );
}
