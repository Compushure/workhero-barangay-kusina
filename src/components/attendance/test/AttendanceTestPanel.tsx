'use client';

import { useAttendanceTestStore } from '@/store/attendanceTestStore';
import { ChevronDown, ChevronUp, TestTube2, X } from 'lucide-react';
import AttendanceConfigEditor from './AttendanceConfigEditor';
import AttendanceDebugLogger from './AttendanceDebugLogger';
import AttendanceStatusDisplay from './AttendanceStatusDisplay';
import type { AttendanceStatus } from '@/types';

interface AttendanceTestPanelProps {
  status?: AttendanceStatus;
}

export default function AttendanceTestPanel({ status }: AttendanceTestPanelProps) {
  const { isPanelOpen, togglePanel } = useAttendanceTestStore();

  if (!isPanelOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={togglePanel}
          className="bg-purple-600 text-white px-4 py-3 rounded-lg shadow-lg hover:bg-purple-700 flex items-center gap-2 font-medium animate-pulse"
        >
          <TestTube2 className="w-5 h-5" />
          <span>Open Test Panel</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-[500px] max-h-[90vh] bg-white border-2 border-purple-500 rounded-lg shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="bg-purple-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TestTube2 className="w-5 h-5" />
          <h2 className="font-bold text-lg">Attendance Test Panel</h2>
        </div>
        <button
          onClick={togglePanel}
          className="hover:bg-purple-700 rounded p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-yellow-50 border border-yellow-300 rounded p-3 text-xs">
          <p className="font-bold text-yellow-900 mb-1">⚠️ DEVELOPER MODE</p>
          <p className="text-yellow-800">
            This panel is for testing and debugging attendance features.
            All config changes are temporary and persist only in local storage.
          </p>
        </div>

        {/* Status Display */}
        <AttendanceStatusDisplay status={status} />

        {/* Config Editor */}
        <AttendanceConfigEditor />

        {/* Debug Logger */}
        <AttendanceDebugLogger />
      </div>

      {/* Footer */}
      <div className="border-t bg-gray-50 px-4 py-2 rounded-b-lg text-center">
        <p className="text-[10px] text-gray-500">
          💾 Config saved to localStorage | 🔄 Refresh page to see changes
        </p>
      </div>
    </div>
  );
}
