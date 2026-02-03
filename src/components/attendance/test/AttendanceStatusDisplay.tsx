'use client';

import { useEffect } from 'react';
import { useAttendanceTestStore } from '@/store/attendanceTestStore';
import type { AttendanceStatus } from '@/types';
import { Clock, User, Coffee, AlertCircle } from 'lucide-react';

interface AttendanceStatusDisplayProps {
  status: AttendanceStatus | undefined;
}

export default function AttendanceStatusDisplay({ status }: AttendanceStatusDisplayProps) {
  const { updateStatus, addLog } = useAttendanceTestStore();

  useEffect(() => {
    if (status) {
      updateStatus(status);
    }
  }, [status, updateStatus]);

  if (!status) {
    return (
      <div className="p-4 bg-gray-50 rounded border border-gray-200 text-center">
        <p className="text-xs text-gray-500">Loading status...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-gray-700">Current Status</h3>
      
      <div className="grid grid-cols-2 gap-2">
        {/* Status Cards */}
        <StatusCard
          icon={<User className="w-4 h-4" />}
          label="Timed In"
          value={status.hasTimedIn}
          activeColor="bg-green-100 border-green-300 text-green-800"
          inactiveColor="bg-gray-100 border-gray-300 text-gray-600"
        />
        
        <StatusCard
          icon={<Clock className="w-4 h-4" />}
          label="Timed Out"
          value={status.hasTimedOut}
          activeColor="bg-red-100 border-red-300 text-red-800"
          inactiveColor="bg-gray-100 border-gray-300 text-gray-600"
        />
        
        <StatusCard
          icon={<Coffee className="w-4 h-4" />}
          label="On Break"
          value={status.isOnBreak ?? false}
          activeColor="bg-orange-100 border-orange-300 text-orange-800"
          inactiveColor="bg-gray-100 border-gray-300 text-gray-600"
        />
        
        <StatusCard
          icon={<AlertCircle className="w-4 h-4" />}
          label="Late"
          value={status.isLate ?? false}
          activeColor="bg-yellow-100 border-yellow-300 text-yellow-800"
          inactiveColor="bg-gray-100 border-gray-300 text-gray-600"
        />
      </div>

      {/* Flags */}
      <div className="border rounded p-2 bg-white text-[10px] space-y-1">
        <p className="font-bold text-gray-700 mb-2">Flags</p>
        <FlagRow label="Can Time In" value={status.canTimeIn} />
        <FlagRow label="Can Time Out" value={status.canTimeOut} />
        <FlagRow label="Can Start Break" value={status.canStartBreak ?? false} />
        <FlagRow label="Can End Break" value={status.canEndBreak ?? false} />
        <FlagRow label="Is Absent" value={status.isAbsent ?? false} danger />
        <FlagRow label="Is Late" value={status.isLate ?? false} warning />
        <FlagRow label="Is Overtime" value={status.isOvertime ?? false} />
        <FlagRow label="Is Undertime" value={status.isUndertime ?? false} />
        <FlagRow label="Over Breaktime" value={status.isOverBreaktime ?? false} warning />
        <FlagRow label="No Timeout" value={status.noTimeout ?? false} />
      </div>

      {/* Timestamps */}
      {(status.timeInTime || status.timeOutTime || status.breakStartTime) && (
        <div className="border rounded p-2 bg-white text-[10px] space-y-1 font-mono">
          <p className="font-bold text-gray-700 mb-2">Timestamps</p>
          {status.timeInTime && (
            <div className="flex justify-between">
              <span className="text-gray-600">Time In:</span>
              <span className="font-semibold">{new Date(status.timeInTime).toLocaleTimeString()}</span>
            </div>
          )}
          {status.timeOutTime && (
            <div className="flex justify-between">
              <span className="text-gray-600">Time Out:</span>
              <span className="font-semibold">{new Date(status.timeOutTime).toLocaleTimeString()}</span>
            </div>
          )}
          {status.breakStartTime && (
            <div className="flex justify-between">
              <span className="text-gray-600">Break Start:</span>
              <span className="font-semibold">{new Date(status.breakStartTime).toLocaleTimeString()}</span>
            </div>
          )}
          {status.breakEndTime && (
            <div className="flex justify-between">
              <span className="text-gray-600">Break End:</span>
              <span className="font-semibold">{new Date(status.breakEndTime).toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      )}

      {/* Message */}
      {status.message && (
        <div className="border rounded p-2 bg-blue-50 border-blue-200">
          <p className="text-xs text-blue-800 font-medium">{status.message}</p>
        </div>
      )}
    </div>
  );
}

function StatusCard({
  icon,
  label,
  value,
  activeColor,
  inactiveColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  activeColor: string;
  inactiveColor: string;
}) {
  return (
    <div className={`border rounded p-2 ${value ? activeColor : inactiveColor}`}>
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <p className="text-[10px] opacity-75">{label}</p>
          <p className="text-xs font-bold">{value ? 'YES' : 'NO'}</p>
        </div>
      </div>
    </div>
  );
}

function FlagRow({ 
  label, 
  value, 
  danger = false,
  warning = false 
}: { 
  label: string; 
  value: boolean; 
  danger?: boolean;
  warning?: boolean;
}) {
  const getColor = () => {
    if (!value) return 'text-gray-400';
    if (danger) return 'text-red-600 font-bold';
    if (warning) return 'text-yellow-700 font-bold';
    return 'text-green-600 font-bold';
  };

  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">{label}</span>
      <span className={`${getColor()} font-mono`}>
        {value ? '✓ TRUE' : '✗ FALSE'}
      </span>
    </div>
  );
}
