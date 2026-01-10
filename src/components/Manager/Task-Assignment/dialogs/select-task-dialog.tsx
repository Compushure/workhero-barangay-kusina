'use client';

import { CirclePlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SelectTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTask: (task: string) => void;
  selectedTask: string | null;
}

// Mock task list
const TASKS = [
  'Internal Training',
  'Project Management',
  'Quality Assurance',
  'Documentation Review',
  'Client Presentation',
  'Code Review',
];

export function SelectTaskDialog({
  isOpen,
  onOpenChange,
  onSelectTask,
  selectedTask,
}: SelectTaskDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-6 rounded-full border border-gray-300 bg-white px-6 text-[#690003] shadow-sm transition-colors hover:bg-gray-50">
          <span>Select Task</span>
          <CirclePlus size={18} />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Task</DialogTitle>
          <DialogDescription>Choose a task to assign to selected employees.</DialogDescription>
        </DialogHeader>
        {/* Dialog content will be customized by user */}
        <div className="space-y-2">
          {TASKS.map((task) => (
            <Button
              key={task}
              variant={selectedTask === task ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => onSelectTask(task)}
            >
              {task}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
