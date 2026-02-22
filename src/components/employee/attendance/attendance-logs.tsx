'use client';

export interface AttendanceLog {
  action: 'timein' | 'timeout' | 'startbreak' | 'endbreak';
  time: string;
  note?: string;
}

interface AttendanceLogsProps {
  logs?: AttendanceLog[];
}

function getLogDisplay(action: AttendanceLog['action']) {
  switch (action) {
    case 'timein':
      return { icon: '📍', label: 'Time In' };
    case 'timeout':
      return { icon: '👋', label: 'Time Out' };
    case 'startbreak':
      return { icon: '🍩', label: 'Break Started' };
    case 'endbreak':
      return { icon: '🔙', label: 'Back to Work' };
    default:
      return { icon: 'ℹ️', label: 'Unknown' };
  }
}

export default function AttendanceLogs({ logs = [] }: AttendanceLogsProps) {
  // Calculate today's reset threshold (7 AM today)
  const now = new Date();
  const resetTime = new Date(now);
  resetTime.setHours(7, 0, 0, 0);

  // Filter logs: only keep those after today's reset
  const filteredLogs = logs.filter((log) => {
    const logTime = new Date(log.time);
    return logTime >= resetTime;
  });

  return (
    <div className="mt-4 w-full max-h-56 overflow-y-auto space-y-3 bg-[#E8DBBF] rounded">
      {filteredLogs.length === 0 ? (
        <p className="text-md text-gray-700 text-center">🚫 No logs yet</p>
      ) : (
        filteredLogs.map((log, idx) => {
          const { icon, label } = getLogDisplay(log.action);
          return (
            <div
              key={idx}
              className="flex flex-col text-black/70 bg-[#DECFB4] rounded px-3 py-2 border border-black/10"
            >
              {/* Top row: Icon + Label + Timestamp */}
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-2">
                  {icon} {label}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(log.time).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </span>
              </div>

              {/* Status Indicator directly under */}
              <span className="text-xs text-gray-700 mt-1"></span>

              {/* Warning note */}
              {log.note && (
                <span className="text-xs text-red-500 mt-1"> {log.note}</span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
