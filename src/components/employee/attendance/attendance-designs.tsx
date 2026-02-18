'use client';

import AttendanceIcon from './attendance';
import { useState } from 'react';
import { RankWidget } from '../dashboard/rank-panel';
import AttendanceLogs, { AttendanceLog } from './attendance-logs';
import XPProgressAndPoints from './xp-points';
import ProfileAndLevel from './profile-level';
import DashboardRedirectButton from './kitchen-redirection';

export default function AttendanceDesign() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [status, setStatus] = useState<any>({});

  // Helper to add a log entry with current timestamp
  const addLog = (action: AttendanceLog['action'], note?: string) => {
    setLogs((prev) => [
      ...prev,
      { action, time: new Date().toISOString(), note },
    ]);

    // Update status flags based on action
    if (action === 'timein') {
      setStatus({ hasTimedIn: true, isOnBreak: false, hasTimedOut: false });
    }
    if (action === 'startbreak') {
      setStatus((prev: any) => ({ ...prev, isOnBreak: true }));
    }
    if (action === 'endbreak') {
      setStatus((prev: any) => ({ ...prev, isOnBreak: false }));
    }
    if (action === 'timeout') {
      setStatus({ hasTimedIn: true, isOnBreak: false, hasTimedOut: true });
    }
  };

  return (
    <div className="flex font-jersey tracking-widest min-h-screen items-center justify-center bg-cover bg-center pixelated relative">
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
        <ProfileAndLevel />
        <XPProgressAndPoints />
      </div>

      {/* Top‑right: Weekly / Rank */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <RankWidget />
      </div>

      {/* Center column: main card + dashboard button */}
      <div className="flex flex-col items-center gap-4 mt-10">
        {/* Main card */}
        <div className="relative flex bg-[#E8DBBF] flex-col items-center parchment-card rounded-xl p-6 max-w-md w-full shadow-[8px_8px_0px_#000] shadow-[#3017008e] animate-fadeIn">
          {/* Header */}
          <h1 className="font-jersey text-3xl text-[#252525d8] text-center mb-1">⏰ Punch Station</h1>
          <p className="font-jersey text-xl text-[#474747d8] text-center text-parchment-foreground/70">
            {new Date().toLocaleString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            })}
          </p>

          {/* Functional Component Slot */}
          <AttendanceIcon config={{}} addLog={addLog} />

          {/* Logs always visible */}
          <AttendanceLogs logs={logs} />
        </div>

        {/* Dashboard Redirect Button directly under the card */}
        <DashboardRedirectButton status={status} />
      </div>
    </div>
  );
}
