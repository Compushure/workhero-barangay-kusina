'use client';

import { useEffect, useState } from 'react';
import AttendanceIcon from './attendance';
import { RankWidget } from '../dashboard/rank-panel';
import DashboardRedirectButton from './kitchen-redirection';
import { useGetTodayAttendanceStatus } from '@/hooks/tanstack';
import { AttendanceCardSkeleton } from './skeletons';
import HeaderHUD from '../widgets/header-hud';

export default function AttendanceDesign() {
  const {
    data: status,
    isLoading: statusLoading,
    isFetching: statusFetching,
  } = useGetTodayAttendanceStatus();
  const [dateLabel, setDateLabel] = useState('');

  useEffect(() => {
    const formatNow = () =>
      setDateLabel(
        new Date().toLocaleString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );

    formatNow();
    const intervalId = setInterval(formatNow, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // ✅ Normalize status for DashboardRedirectButton
  const redirectStatus = {
    hasTimedIn: status?.hasTimedIn ?? false,
    isOnBreak: status?.isOnBreak ?? false,
    hasTimedOut: status?.hasTimedOut ?? false,
  };

  const isAttendanceLoading = statusLoading || statusFetching;

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-y-auto bg-cover bg-center font-jersey tracking-widest pixelated">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <img
          src="/assets/att.png"
          alt="Attendance background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0e0d0c]/30"></div>
      </div>

      {/* Overlay top widgets (do not affect layout flow) */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 z-20 w-full px-2 pt-2 sm:px-4">
        <div className="pointer-events-auto flex w-full flex-col gap-2">
          <HeaderHUD className="rounded-lg" />
          <div className="flex w-full justify-end pr-1 sm:pr-2 lg:pr-4">
            <RankWidget />
          </div>
        </div>
      </div>

      {/* Center column: main card + dashboard button */}
      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-4 py-8 mt-5">
        <div className="flex w-full max-w-4xl flex-col items-center text-center pb-12">
          {/* Main card */}
          {isAttendanceLoading ? (
            <AttendanceCardSkeleton />
          ) : (
            <div className="relative flex bg-[#E8DBBF] border-3 border-[#47331F] flex-col items-center parchment-card rounded-xl p-6 max-w-md w-full overflow-visible md:overflow-auto max-h-none md:max-h-[85vh] shadow-[6px_6px_0px_#000] shadow-[#47331F]/50 animate-fadeIn">
              {/* Header */}
              <h1 className="font-jersey text-3xl text-[#252525d8] text-center mb-1">
                ⏰ Attendance Station
              </h1>
              <p className="font-jersey text-xl text-center text-parchment-foreground/70">
                {dateLabel || 'Loading time…'}
              </p>

              {/* Attendance controls */}
              <AttendanceIcon config={{}} />
            </div>
          )}

          {/* Dashboard Redirect Button directly under the card */}
          <DashboardRedirectButton status={redirectStatus} />
        </div>
      </div>
    </div>
  );
}