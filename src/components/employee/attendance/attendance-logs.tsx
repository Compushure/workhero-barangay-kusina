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
  // Keep only logs from today; avoid hard-coded hour so early shifts still show
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const filteredLogs = logs.filter((log) => {
    const logTime = new Date(log.time);
    return !Number.isNaN(logTime.getTime()) && logTime.toDateString() === today.toDateString();
  });

  return (
    <div className="mt-2 w-full max-h-none md:max-h-54 overflow-visible md:overflow-y-auto space-y-2 bg-[#E8DBBF] rounded">
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
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-lg flex items-center gap-2">
                    {icon} {label}
                  </span>
                  {log.note && <span className="text-sm text-red-500">{log.note}</span>}
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(log.time).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
