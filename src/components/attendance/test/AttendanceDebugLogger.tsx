'use client';

import { useAttendanceTestStore } from '@/store/attendanceTestStore';
import { Clock, AlertTriangle, Info, XCircle, CheckCircle } from 'lucide-react';

const getLogIcon = (type: string) => {
  switch (type) {
    case 'action':
      return <CheckCircle className="w-3 h-3" />;
    case 'warning':
      return <AlertTriangle className="w-3 h-3" />;
    case 'error':
      return <XCircle className="w-3 h-3" />;
    case 'info':
      return <Info className="w-3 h-3" />;
    default:
      return <Clock className="w-3 h-3" />;
  }
};

const getLogColor = (type: string) => {
  switch (type) {
    case 'action':
      return 'bg-green-50 border-green-200 text-green-800';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    case 'error':
      return 'bg-red-50 border-red-200 text-red-800';
    case 'info':
      return 'bg-blue-50 border-blue-200 text-blue-800';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-800';
  }
};

const getCategoryBadge = (category: string) => {
  const colors = {
    timein: 'bg-green-100 text-green-700',
    timeout: 'bg-red-100 text-red-700',
    break: 'bg-orange-100 text-orange-700',
    config: 'bg-purple-100 text-purple-700',
    system: 'bg-gray-100 text-gray-700',
  };
  
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${colors[category as keyof typeof colors] || colors.system}`}>
      {category.toUpperCase()}
    </span>
  );
};

export default function AttendanceDebugLogger() {
  const { logs, clearLogs } = useAttendanceTestStore();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-700">Debug Logs</h3>
        <button
          onClick={clearLogs}
          className="text-xs text-red-600 hover:text-red-800 font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-1 border rounded p-2 bg-white">
        {logs.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No logs yet. Actions will appear here.</p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`border rounded p-2 text-xs ${getLogColor(log.type)}`}
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5">{getLogIcon(log.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getCategoryBadge(log.category)}
                    <span className="text-[10px] text-gray-500 font-mono">
                      {log.timestamp.toLocaleTimeString('en-US', { 
                        hour12: false, 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit' 
                      })}
                    </span>
                  </div>
                  <p className="font-medium">{log.message}</p>
                  {log.data && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-[10px] opacity-70 hover:opacity-100">
                        View Data
                      </summary>
                      <pre className="mt-1 p-2 bg-black/5 rounded text-[9px] overflow-x-auto font-mono">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
