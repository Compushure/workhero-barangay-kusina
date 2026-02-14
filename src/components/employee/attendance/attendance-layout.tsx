'use client';

import { ChefCharacter } from './chief';
import { DiningTable } from './dining';
import { Ladle } from './ladle';
import { AttendanceSheet } from './attendance-sheet';
import { FloorCabinet } from './floor-cabinet';
import { HangingCabinet } from './hanging-cabinet';
import { Window } from './window';
import { Door } from './door';

export function AttendanceLayout() {
  return (
    <div className="w-full h-dvh min-w-[1400px] min-h-[730px] bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center overflow-hidden">

      {/* FIXED SCENE WRAPPER */}
      <div className="relative w-[1400px] h-[900px]">

        {/* Floor cabinet - bottom left */}
        <div className="absolute z-0 bottom-[10%] left-[-1%]">
          <FloorCabinet width={300} height={140} />
        </div>

        {/* Hanging cabinet - top left */}
        <div className="absolute z-0 top-[15%] left-[-1%]">
          <HangingCabinet width={300} height={120} />
        </div>
        
        {/* Door - center top */}
        <div className="absolute z-0 top-[14%] left-[37%] -translate-x-1/2">
          <Door width={420} height={500} />
        </div>

        {/* Windows */}
        <div className="absolute z-0 top-[10%] right-[1%]">
          <Window width={350} height={140} />
        </div>

        <div className="absolute z-0 top-[10%] left-[52%]">
          <Window width={350} height={140} />
        </div>

        {/* Chef Character */}
        <div className="absolute z-10 bottom-[10%] left-1/2 -translate-x-1/32">
          <ChefCharacter width={400} height={280} />
        </div>

        {/* Table */}
        <div className="absolute z-20 top-[50%] left-1/2 -translate-x-1/4 flex flex-col items-center">
          
          <div className="drop-shadow-[10px_12px_12px_rgba(0,0,0,0.35)]">
            <DiningTable width={700} height={140} />
          </div>

          {/* Items on table */}
          <div className="absolute top-[5%] left-1/2 -translate-x-1/2 flex gap-45">

            {/* Attendance Sheet */}
            <div className="flex-shrink-0 mb-55 drop-shadow-[6px_8px_8px_rgba(0,0,0,0.35)]">
              <AttendanceSheet width={150} height={160} />
            </div>

            {/* Ladle */}
            <div className="flex-shrink-0 mr-65 -rotate-48 drop-shadow-[4px_6px_6px_rgba(0,0,0,0.4)]">
              <Ladle width={70} height={120} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
