'use client';

import AttendanceIcon from './attendance';
import { useState } from 'react';
import LevelIcon from '../dashboard/level-widget';
import { RankWidget } from '../dashboard/rank-panel';
import { ProfilePic } from '../dashboard/user-profile';
import AttendanceLogs from './attendance-logs';
import type { AttendanceLog } from './attendance-logs';

export default function AttendanceDesign() {
  const [nowTime] = useState<Date>(new Date());

  const sampleLogs: AttendanceLog[] = [
    { action: 'timeout', time: new Date().toISOString(), note: 'Working undertime!' },
    { action: 'endbreak', time: new Date().toISOString() },
    { action: 'startbreak', time: new Date().toISOString() },
    { action: 'timein', time: new Date().toISOString(), note: 'Late punch in!' },
  ];

  return (
    <div
      className={`flex font-jersey tracking-widest min-h-screen items-center justify-center bg-cover bg-center pixelated relative`}
    >
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <img
          src="/assets/att.png"
          alt="Attendance background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0e0d0c]/30"></div>
      </div>

      {/* Top‑left: Profile + Level */}
      <div className="absolute top-4 left-4 flex flex-row items-center gap-6">
        <ProfilePic />
        <LevelIcon />
      </div>

      {/* Top‑right: Weekly / Rank */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <RankWidget />
      </div>

      {/* Main card */}
      <div className="relative flex mt-10 bg-[#E8DBBF] flex-col items-center parchment-card rounded-xl p-6 max-w-md w-full shadow-[8px_8px_0px_#000] shadow-[#3017008e] animate-fadeIn">
        {/* Header */}
        <h1 className="font-jersey text-3xl text-[#252525d8] text-center mb-1">⏰ Punch Station</h1>
        <p className="font-jersey text-xl text-[#474747d8] text-center text-parchment-foreground/70">
          {nowTime.toLocaleString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          })}
        </p>

        {/* Functional Component Slot */}
        <AttendanceIcon />

        {/* Logs always visible */}
        <AttendanceLogs logs={sampleLogs} />
      </div>
    </div>
  );
}
