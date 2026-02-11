'use client';

import { useState } from 'react';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import type { AttendanceConfig } from '@/types';

interface AttendanceConfigEditorProps {
  config: AttendanceConfig;
  onConfigChange: (config: Partial<AttendanceConfig>) => void;
}

export default function AttendanceConfigEditor({ config, onConfigChange }: AttendanceConfigEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempConfig, setTempConfig] = useState<AttendanceConfig>(config);

  const handleApply = () => {
    onConfigChange(tempConfig);
  };

  const handleReset = () => {
    setTempConfig(config);
    onConfigChange({});
  };

  return (
    <div className="mt-3 border-t pt-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-800"
      >
        <Settings className="w-4 h-4" />
        Config Editor (Testing)
        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {isOpen && (
        <div className="mt-2 p-3 bg-gray-50 rounded border space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-medium mb-1">Time In</label>
              <input
                type="time"
                value={tempConfig.timeInAt}
                onChange={(e) => setTempConfig({ ...tempConfig, timeInAt: e.target.value })}
                className="w-full border rounded px-2 py-1 text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium mb-1">Late After</label>
              <input
                type="time"
                value={tempConfig.lateAfter}
                onChange={(e) => setTempConfig({ ...tempConfig, lateAfter: e.target.value })}
                className="w-full border rounded px-2 py-1 text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium mb-1">Time Out</label>
              <input
                type="time"
                value={tempConfig.timeOutAt}
                onChange={(e) => setTempConfig({ ...tempConfig, timeOutAt: e.target.value })}
                className="w-full border rounded px-2 py-1 text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium mb-1">Overtime After</label>
              <input
                type="time"
                value={tempConfig.overtimeAfter}
                onChange={(e) => setTempConfig({ ...tempConfig, overtimeAfter: e.target.value })}
                className="w-full border rounded px-2 py-1 text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium mb-1">Auto Timeout</label>
              <input
                type="time"
                value={tempConfig.autoTimeoutAt}
                onChange={(e) => setTempConfig({ ...tempConfig, autoTimeoutAt: e.target.value })}
                className="w-full border rounded px-2 py-1 text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium mb-1">Break Duration</label>
              <input
                type="time"
                value={tempConfig.breaktime_duration}
                onChange={(e) => setTempConfig({ ...tempConfig, breaktime_duration: e.target.value })}
                className="w-full border rounded px-2 py-1 text-xs"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleReset}
              className="flex-1 border border-gray-300 rounded px-3 py-1 text-xs hover:bg-gray-100"
            >
              Reset
            </button>
            <button
              onClick={handleApply}
              className="flex-1 bg-blue-500 text-white rounded px-3 py-1 text-xs hover:bg-blue-600"
            >
              Apply
            </button>
          </div>

          <p className="text-[10px] text-gray-500 text-center">
            ⚠️ Temporary - resets on page refresh
          </p>
        </div>
      )}
    </div>
  );
}
