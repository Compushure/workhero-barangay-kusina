'use client';

import { useEffect, useState } from 'react';
import AttendanceIcon from './attendance';
import { RankWidget } from '../dashboard/rank-panel';
import XPProgressAndPoints from './xp-points';
import ProfileAndLevel from './profile-level';
import DashboardRedirectButton from './kitchen-redirection';
import { Card, CardContent } from '@/components/ui/card';
import { useGetTodayAttendanceStatus } from '@/hooks/tanstack';
import { AttendanceCardSkeleton } from './skeletons';

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
        })
      );

    formatNow();
    const intervalId = setInterval(formatNow, 60000);

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
    <div className="flex flex-col font-jersey tracking-widest min-h-screen items-center bg-cover bg-center pixelated relative overflow-y-auto">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <img
          src="/assets/att.png"
          alt="Attendance background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0e0d0c]/30"></div>
      </div>

      {/* Responsive top bar for widgets */}
      <div className="sticky top-0 left-0 right-0 w-full px-2 sm:px-4 pt-2 z-20 pointer-events-none">
        <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-4 p-1">
          <div className="pointer-events-auto flex items-center gap-3 sm:gap-4 flex-nowrap overflow-x-auto">
            <ProfileAndLevel />
            <XPProgressAndPoints />
          </div>

          <div className="pointer-events-auto w-full sm:w-auto flex justify-end">
            <Card className="bg-transparent shadow-none border-none w-full sm:w-auto p-0 gap-0">
              <CardContent className="p-0">
                <RankWidget />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Center column: main card + dashboard button */}
      <div className="flex flex-col items-center px-4 text-center w-full max-w-4xl pb-12">
        {/* Main card */}
        {isAttendanceLoading ? (
          <AttendanceCardSkeleton />
        ) : (
          <div className="relative flex bg-[#E8DBBF] border-3 border-[#47331F] flex-col items-center parchment-card rounded-xl p-6 max-w-md w-full overflow-visible md:overflow-auto max-h-none md:max-h-[85vh] shadow-[6px_6px_0px_#000] shadow-[#47331F]/50 animate-fadeIn">
            {/* Header */}
            <h1 className="font-jersey text-3xl text-[#252525d8] text-center mb-1">
              ⏰ Attendance Station
            </h1>
            <p className="font-jersey text-xl text-[#474747d8] text-center text-parchment-foreground/70">
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
  );
}
