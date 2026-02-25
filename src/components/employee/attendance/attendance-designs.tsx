'use client';

import AttendanceIcon from './attendance';
import { RankWidget } from '../dashboard/rank-panel';
import XPProgressAndPoints from './xp-points';
import ProfileAndLevel from './profile-level';
import DashboardRedirectButton from './kitchen-redirection';
import { Card, CardContent } from '@/components/ui/card';
import { useGetTodayAttendanceStatus } from '@/hooks/tanstack';

export default function AttendanceDesign() {
  const { data: status } = useGetTodayAttendanceStatus();

  // ✅ Normalize status for DashboardRedirectButton
  const redirectStatus = {
    hasTimedIn: status?.hasTimedIn ?? false,
    isOnBreak: status?.isOnBreak ?? false,
    hasTimedOut: status?.hasTimedOut ?? false,
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

      {/* Top‑right: Weekly / Rank (same wrapper as employee dashboard) */}
      <div className="absolute top-4 right-4">
        <Card className="bg-transparent shadow-none border-none">
          <CardContent>
            <RankWidget />
          </CardContent>
        </Card>
      </div>

      {/* Center column: main card + dashboard button */}
      <div className="flex flex-col items-center gap-4 mt-10">
        {/* Main card */}
        <div className="relative flex bg-[#E8DBBF] border-3 border-[#47331F] flex-col items-center parchment-card rounded-xl p-6 max-w-md w-full shadow-[6px_6px_0px_#000] shadow-[#47331F]/50 animate-fadeIn">
          {/* Header */}
          <h1 className="font-jersey text-3xl text-[#252525d8] text-center mb-1">
            ⏰ Attendance Station
          </h1>
          <p className="font-jersey text-xl text-[#474747d8] text-center text-parchment-foreground/70">
            {new Date().toLocaleString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>

          {/* Attendance controls */}
          <AttendanceIcon config={{}} />
        </div>

        {/* Dashboard Redirect Button directly under the card */}
        <DashboardRedirectButton status={redirectStatus} />
      </div>
    </div>
  );
}
