import { create } from 'zustand';
import type { VerificationRequest } from '@/types';

interface TaskState {
  tasks: VerificationRequest[];
  setTasks: (tasks: VerificationRequest[]) => void;
  optimisticApprove: (id: string) => void;
  optimisticReject: (id: string) => void;
  updateTask: (id: string, updates: Partial<VerificationRequest>) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  setTasks: (tasks: VerificationRequest[]) => set({ tasks }),
  optimisticApprove: (id: string) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.kpitask_id === id ? { ...task, status: 'approved' } : task
      ),
    })),
  optimisticReject: (id: string) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.kpitask_id === id ? { ...task, status: 'rejected' } : task
      ),
    })),
  updateTask: (id: string, updates: Partial<VerificationRequest>) =>
    set((state) => ({
      tasks: state.tasks.map((task) => (task.kpitask_id === id ? { ...task, ...updates } : task)),
    })),
}));
