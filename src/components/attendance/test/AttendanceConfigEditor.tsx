'use client';

import { useState, useEffect } from 'react';
import { useAttendanceTestStore } from '@/store/attendanceTestStore';
import { attendanceConfig } from '@/lib/attendance-config';
import type { AttendanceConfig } from '@/types';

export default function AttendanceConfigEditor() {
  const { configOverrides, setConfigOverrides, resetConfig, addLog } = useAttendanceTestStore();
  
  // Merge with defaults
  const currentConfig: AttendanceConfig = {
    ...attendanceConfig,
    ...configOverrides,
  };

  const [tempConfig, setTempConfig] = useState(currentConfig);

  useEffect(() => {
    setTempConfig({ ...attendanceConfig, ...configOverrides });
  }, [configOverrides]);

  const handleApply = () => {
    setConfigOverrides(tempConfig);
  };

  const handleQuickSet = (preset: string) => {
    const now = new Date();
    const presets: Record<string, Partial<AttendanceConfig>> = {
      'test-late': {
        timeInAt: formatTime(addMinutes(now, -10)),
        lateAfter: formatTime(addMinutes(now, -5)),
        timeOutAt: formatTime(addMinutes(now, 60)),
      },
      'test-absent': {
        timeInAt: formatTime(addMinutes(now, -120)),
        lateAfter: formatTime(addMinutes(now, -110)),
        autoTimeoutAt: formatTime(addMinutes(now, -1)),
      },
      'test-break': {
        timeInAt: formatTime(addMinutes(now, -30)),
        breaktime_duration: '00:01', // 1 minute for quick testing
      },
      'now-window': {
        timeInAt: formatTime(now),
        lateAfter: formatTime(addMinutes(now, 5)),
        timeOutAt: formatTime(addMinutes(now, 60)),
        autoTimeoutAt: formatTime(addMinutes(now, 120)),
      },
    };

    const presetData = presets[preset];
    if (presetData) {
      const newConfig = { ...currentConfig, ...presetData };
      setTempConfig(newConfig);
      setConfigOverrides(newConfig);
      addLog({
        type: 'action',
        category: 'config',
        message: `Applied preset: ${preset}`,
        data: presetData,
      });
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-700">Configuration</h3>

      {/* Quick Presets */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleQuickSet('test-late')}
          className="px-3 py-2 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded font-medium"
        >
          🕐 Test Late Arrival
        </button>
        <button
          onClick={() => handleQuickSet('test-absent')}
          className="px-3 py-2 text-xs bg-red-100 hover:bg-red-200 text-red-800 rounded font-medium"
        >
          ❌ Test Auto-Absent
        </button>
        <button
          onClick={() => handleQuickSet('test-break')}
          className="px-3 py-2 text-xs bg-orange-100 hover:bg-orange-200 text-orange-800 rounded font-medium"
        >
          ☕ Test Break (1min)
        </button>
        <button
          onClick={() => handleQuickSet('now-window')}
          className="px-3 py-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded font-medium"
        >
          ⏰ Active Now
        </button>
      </div>

      {/* Manual Config */}
      <div className="border rounded p-3 bg-gray-50 space-y-2">
        <p className="text-xs font-semibold text-gray-600 mb-2">Manual Configuration</p>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-medium mb-1 text-gray-700">Time In At</label>
            <input
              type="time"
              value={tempConfig.timeInAt}
              onChange={(e) => setTempConfig({ ...tempConfig, timeInAt: e.target.value })}
              className="w-full border rounded px-2 py-1 text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium mb-1 text-gray-700">Late After</label>
            <input
              type="time"
              value={tempConfig.lateAfter}
              onChange={(e) => setTempConfig({ ...tempConfig, lateAfter: e.target.value })}
              className="w-full border rounded px-2 py-1 text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium mb-1 text-gray-700">Time Out At</label>
            <input
              type="time"
              value={tempConfig.timeOutAt}
              onChange={(e) => setTempConfig({ ...tempConfig, timeOutAt: e.target.value })}
              className="w-full border rounded px-2 py-1 text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium mb-1 text-gray-700">Overtime After</label>
            <input
              type="time"
              value={tempConfig.overtimeAfter}
              onChange={(e) => setTempConfig({ ...tempConfig, overtimeAfter: e.target.value })}
              className="w-full border rounded px-2 py-1 text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium mb-1 text-gray-700">Auto Timeout At</label>
            <input
              type="time"
              value={tempConfig.autoTimeoutAt}
              onChange={(e) => setTempConfig({ ...tempConfig, autoTimeoutAt: e.target.value })}
              className="w-full border rounded px-2 py-1 text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium mb-1 text-gray-700">
              Break Duration (HH:MM)
            </label>
            <input
              type="text"
              pattern="[0-9]{2}:[0-9]{2}"
              placeholder="01:00"
              value={tempConfig.breaktime_duration}
              onChange={(e) => {
                const value = e.target.value;
                // Auto-format as HH:MM
                if (value.length === 2 && !value.includes(':')) {
                  setTempConfig({ ...tempConfig, breaktime_duration: value + ':' });
                } else {
                  setTempConfig({ ...tempConfig, breaktime_duration: value });
                }
              }}
              className="w-full border rounded px-2 py-1 text-xs font-mono"
            />
            <p className="text-[9px] text-gray-500 mt-0.5">Duration, not time (no AM/PM)</p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => {
              resetConfig();
              setTempConfig(attendanceConfig);
            }}
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-xs hover:bg-white font-medium"
          >
            Reset to Default
          </button>
          <button
            onClick={handleApply}
            className="flex-1 bg-blue-600 text-white rounded px-3 py-1.5 text-xs hover:bg-blue-700 font-medium"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

function formatTime(date: Date): string {
  return date.toTimeString().substring(0, 5);
}
