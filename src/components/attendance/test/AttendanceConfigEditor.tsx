'use client';

import { useState, useEffect } from 'react';
import { useAttendanceTestStore } from '@/store/attendanceTestStore';
import { attendanceConfig } from '@/lib/attendance-config';
import type { AttendanceConfig } from '@/types';
import { AlertTriangle } from 'lucide-react';

interface ValidationError {
  field: string;
  message: string;
}

export default function AttendanceConfigEditor() {
  const { configOverrides, setConfigOverrides, resetConfig, addLog } = useAttendanceTestStore();
  
  // Merge with defaults
  const currentConfig: AttendanceConfig = {
    ...attendanceConfig,
    ...configOverrides,
  };

  const [tempConfig, setTempConfig] = useState(currentConfig);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    setTempConfig({ ...attendanceConfig, ...configOverrides });
  }, [configOverrides]);

  /**
   * Validate configuration rules
   */
  const validateConfig = (config: AttendanceConfig): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Helper: convert HH:MM to minutes for comparison
    const timeToMinutes = (time: string): number => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    const timeInMin = timeToMinutes(config.timeInAt);
    const lateMin = timeToMinutes(config.lateAfter);
    const timeOutMin = timeToMinutes(config.timeOutAt);
    const overtimeMin = timeToMinutes(config.overtimeAfter);
    const autoTimeoutMin = timeToMinutes(config.autoTimeoutAt);
    const breakDurationMin = timeToMinutes(config.breaktime_duration);

    // 1. Late After must be >= Time In At
    if (lateMin < timeInMin) {
      errors.push({
        field: 'lateAfter',
        message: 'Late time must be after or equal to Time In time',
      });
    }

    // 2. Time Out At must be > Time In At (must be later in the day)
    if (timeOutMin <= timeInMin) {
      errors.push({
        field: 'timeOutAt',
        message: 'Time Out must be after Time In',
      });
    }

    // 3. Overtime After must be >= Time Out At
    if (overtimeMin < timeOutMin) {
      errors.push({
        field: 'overtimeAfter',
        message: 'Overtime time must be after or equal to Time Out time',
      });
    }

    // 4. Auto Timeout At must be > Time Out At (end of day)
    if (autoTimeoutMin <= timeOutMin) {
      errors.push({
        field: 'autoTimeoutAt',
        message: 'Auto Timeout must be after Time Out time',
      });
    }

    // 5. Break Duration must be at least 1 minute
    if (breakDurationMin < 1) {
      errors.push({
        field: 'breaktime_duration',
        message: 'Break duration must be at least 1 minute (00:01)',
      });
    }

    // 6. Break Duration must be reasonable (not more than 8 hours)
    if (breakDurationMin > 480) {
      // 480 = 8 hours
      errors.push({
        field: 'breaktime_duration',
        message: 'Break duration seems too long (max 8 hours)',
      });
    }

    return errors;
  };

  const handleApply = () => {
    const errors = validateConfig(tempConfig);
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      addLog({
        type: 'error',
        category: 'config',
        message: `Configuration validation failed: ${errors.length} error(s)`,
        data: { errors: errors as unknown as Record<string, unknown> },
      });
      return;
    }

    setValidationErrors([]);
    setConfigOverrides(tempConfig);
    addLog({
      type: 'action',
      category: 'config',
      message: 'Configuration updated successfully',
      data: tempConfig as Record<string, unknown>,
    });
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
      
      // Validate preset before applying
      const errors = validateConfig(newConfig);
      if (errors.length > 0) {
        addLog({
          type: 'error',
          category: 'config',
          message: `Preset "${preset}" has validation errors`,
          data: { errors: errors as unknown as Record<string, unknown> },
        });
        setValidationErrors(errors);
        return;
      }

      setTempConfig(newConfig);
      setConfigOverrides(newConfig);
      setValidationErrors([]);
      addLog({
        type: 'action',
        category: 'config',
        message: `Applied preset: ${preset}`,
        data: presetData as Record<string, unknown>,
      });
    }
  };

  const hasErrors = validationErrors.length > 0;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-700">Configuration</h3>

      {/* Validation Errors Display */}
      {hasErrors && (
        <div className="border-l-4 border-red-500 bg-red-50 p-3 rounded space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-xs font-bold text-red-700">Validation Errors</p>
          </div>
          <div className="space-y-1 ml-6">
            {validationErrors.map((error, idx) => (
              <div key={idx} className="text-xs text-red-600">
                <span className="font-medium">{error.field}:</span> {error.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Presets */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleQuickSet('test-late')}
          className="px-3 py-2 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={hasErrors}
        >
          🕐 Test Late Arrival
        </button>
        <button
          onClick={() => handleQuickSet('test-absent')}
          className="px-3 py-2 text-xs bg-red-100 hover:bg-red-200 text-red-800 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={hasErrors}
        >
          ❌ Test Auto-Absent
        </button>
        <button
          onClick={() => handleQuickSet('test-break')}
          className="px-3 py-2 text-xs bg-orange-100 hover:bg-orange-200 text-orange-800 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={hasErrors}
        >
          ☕ Test Break (1min)
        </button>
        <button
          onClick={() => handleQuickSet('now-window')}
          className="px-3 py-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={hasErrors}
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
              onChange={(e) => {
                setTempConfig({ ...tempConfig, timeInAt: e.target.value });
                setValidationErrors([]); // Clear errors on change
              }}
              className={`w-full border rounded px-2 py-1 text-xs ${
                validationErrors.some(e => e.field === 'timeInAt') ? 'border-red-500 bg-red-50' : ''
              }`}
            />
            <p className="text-[9px] text-gray-500 mt-0.5">Work starts</p>
          </div>

          <div>
            <label className="block text-[10px] font-medium mb-1 text-gray-700">Late After</label>
            <input
              type="time"
              value={tempConfig.lateAfter}
              onChange={(e) => {
                setTempConfig({ ...tempConfig, lateAfter: e.target.value });
                setValidationErrors([]); // Clear errors on change
              }}
              className={`w-full border rounded px-2 py-1 text-xs ${
                validationErrors.some(e => e.field === 'lateAfter') ? 'border-red-500 bg-red-50' : ''
              }`}
            />
            <p className="text-[9px] text-gray-500 mt-0.5">≥ Time In</p>
          </div>

          <div>
            <label className="block text-[10px] font-medium mb-1 text-gray-700">Time Out At</label>
            <input
              type="time"
              value={tempConfig.timeOutAt}
              onChange={(e) => {
                setTempConfig({ ...tempConfig, timeOutAt: e.target.value });
                setValidationErrors([]); // Clear errors on change
              }}
              className={`w-full border rounded px-2 py-1 text-xs ${
                validationErrors.some(e => e.field === 'timeOutAt') ? 'border-red-500 bg-red-50' : ''
              }`}
            />
            <p className="text-[9px] text-gray-500 mt-0.5">&gt; Time In</p>
          </div>

          <div>
            <label className="block text-[10px] font-medium mb-1 text-gray-700">Overtime After</label>
            <input
              type="time"
              value={tempConfig.overtimeAfter}
              onChange={(e) => {
                setTempConfig({ ...tempConfig, overtimeAfter: e.target.value });
                setValidationErrors([]); // Clear errors on change
              }}
              className={`w-full border rounded px-2 py-1 text-xs ${
                validationErrors.some(e => e.field === 'overtimeAfter') ? 'border-red-500 bg-red-50' : ''
              }`}
            />
            <p className="text-[9px] text-gray-500 mt-0.5">≥ Time Out</p>
          </div>

          <div>
            <label className="block text-[10px] font-medium mb-1 text-gray-700">Auto Timeout At</label>
            <input
              type="time"
              value={tempConfig.autoTimeoutAt}
              onChange={(e) => {
                setTempConfig({ ...tempConfig, autoTimeoutAt: e.target.value });
                setValidationErrors([]); // Clear errors on change
              }}
              className={`w-full border rounded px-2 py-1 text-xs ${
                validationErrors.some(e => e.field === 'autoTimeoutAt') ? 'border-red-500 bg-red-50' : ''
              }`}
            />
            <p className="text-[9px] text-gray-500 mt-0.5">&gt; Time Out</p>
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
                setValidationErrors([]); // Clear errors on change
              }}
              className={`w-full border rounded px-2 py-1 text-xs font-mono ${
                validationErrors.some(e => e.field === 'breaktime_duration') ? 'border-red-500 bg-red-50' : ''
              }`}
            />
            <p className="text-[9px] text-gray-500 mt-0.5">Min: 00:01, Max: 08:00</p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => {
              resetConfig();
              setTempConfig(attendanceConfig);
              setValidationErrors([]);
            }}
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-xs hover:bg-white font-medium"
          >
            Reset to Default
          </button>
          <button
            onClick={handleApply}
            className={`flex-1 rounded px-3 py-1.5 text-xs font-medium ${
              hasErrors
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            disabled={hasErrors}
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
