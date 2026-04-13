import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AttendanceConfig, AttendanceStatus } from '@/types';
import { attendanceConfig } from '@/lib/attendance-config';


// FEEL FREE TO IGNORE THIS IS JSUT FOR THE DEBUG TESTING 
interface AttendanceTestState {
  // Config overrides for testing
  configOverrides: Partial<AttendanceConfig>;
  setConfigOverrides: (config: Partial<AttendanceConfig>) => void;
  resetConfig: () => void;
  
  // Debug logging
  logs: AttendanceLog[];
  addLog: (log: Omit<AttendanceLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  
  // Panel visibility
  isPanelOpen: boolean;
  togglePanel: () => void;
  
  // Current status tracking
  lastStatus: AttendanceStatus | null;
  updateStatus: (status: AttendanceStatus) => void;
}

export interface AttendanceLog {
  id: string;
  timestamp: Date;
  type: 'action' | 'status' | 'warning' | 'error' | 'info';
  category: 'timein' | 'timeout' | 'break' | 'config' | 'system';
  message: string;
  data?: Record<string, unknown>;
}

export const useAttendanceTestStore = create<AttendanceTestState>()(
  persist(
    (set, get) => ({
      // Config
      configOverrides: {},
      setConfigOverrides: (config) => {
        set({ configOverrides: config });
        get().addLog({
          type: 'action',
          category: 'config',
          message: 'Config updated',
          data: config,
        });
      },
      resetConfig: () => {
        set({ configOverrides: {} });
        get().addLog({
          type: 'action',
          category: 'config',
          message: 'Config reset to defaults',
          data: { config: attendanceConfig },
        });
      },
      
      // Logging
      logs: [],
      addLog: (log) => {
        const newLog: AttendanceLog = {
          ...log,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        };
        set((state) => ({
          logs: [newLog, ...state.logs].slice(0, 100), // Keep last 100 logs
        }));
      },
      clearLogs: () => set({ logs: [] }),
      
      // Panel
      isPanelOpen: true, // Default open for dev visibility
      togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
      
      // Status tracking
      lastStatus: null,
      updateStatus: (status) => {
        const prev = get().lastStatus;
        
        // Log significant changes
        if (prev?.canTimeIn !== status.canTimeIn) {
          get().addLog({
            type: status.canTimeIn ? 'info' : 'warning',
            category: 'timein',
            message: `Time in ${status.canTimeIn ? 'available' : 'unavailable'}`,
            data: { status },
          });
        }
        
        if (prev?.isOnBreak !== status.isOnBreak) {
          get().addLog({
            type: 'status',
            category: 'break',
            message: status.isOnBreak ? 'Break started' : 'Break ended',
            data: { status },
          });
        }
        
        if (prev?.hasTimedOut !== status.hasTimedOut && status.hasTimedOut) {
          get().addLog({
            type: 'status',
            category: 'timeout',
            message: 'Timed out for the day',
            data: { status },
          });
        }
        
        set({ lastStatus: status });
      },
    }),
    {
      name: 'attendance-test-storage',
      partialize: (state) => ({
        configOverrides: state.configOverrides,
        isPanelOpen: state.isPanelOpen,
      }),
    }
  )
);
