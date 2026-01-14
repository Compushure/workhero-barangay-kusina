'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { MoreVertical, ChevronDown, X } from 'lucide-react';
import { DatePickerPopover } from './date-picker-popover';
import type { AssignedTask } from './task-assignment-page';

interface TaskViewCardProps {
  task: AssignedTask;
  onRemoveAssignment: (taskId: string, employeeId: string) => void;
  onDeleteTask?: (taskId: string) => void;
}

export function TaskViewCard({ task, onRemoveAssignment, onDeleteTask }: TaskViewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editMaxAttempts, setEditMaxAttempts] = useState(task.maxAttempts);
  const [editDueDate, setEditDueDate] = useState(new Date(task.dateRange.end));
  const [openPopover, setOpenPopover] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const displayedEmployees = expanded ? task.assignedEmployees : task.assignedEmployees.slice(0, 4);
  const hiddenCount = Math.max(0, task.assignedEmployees.length - 4);

  const handleEditTask = () => {
    setShowEditDialog(false);
  };

  return (
    <div className="rounded-2xl bg-[#FAFAFA] p-6 shadow-sm/25">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[#690003] mb-1">{task.taskName}</h3>
          <p className="text-sm text-gray-500 mb-3">{task.taskType}</p>
          <div className="flex gap-6 text-sm text-gray-600">
            <span>
              {task.dateRange.start} - {task.dateRange.end}
            </span>
            <span>Max attempts: {task.maxAttempts}</span>
            <span className="flex items-center gap-2">
              <span>{task.points} pts</span>
              <span>XP {task.xp}</span>
            </span>
          </div>
        </div>

        <Popover open={openPopover} onOpenChange={setOpenPopover}>
          <PopoverTrigger asChild>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-5 h-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-2" align="end">
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => {
                  setShowEditDialog(true);
                  setOpenPopover(false);
                }}
                variant="ghost"
                className="justify-start text-[#690003] hover:bg-[#FBF4E8]"
              >
                Edit Task
              </Button>
              <Button
                onClick={() => {
                  setShowDeleteConfirm(true);
                  setOpenPopover(false);
                }}
                variant="ghost"
                className="justify-start text-red-600 hover:bg-red-50"
              >
                Delete Task
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Assigned To Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-[#690003]">
            Assigned to{' '}
            <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded-full text-sm ml-2">
              {task.assignedEmployees.length}
            </span>
          </h4>
          {hiddenCount > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[#690003] font-medium flex items-center gap-1 hover:underline"
            >
              See All{' '}
              <ChevronDown className={`w-4 h-4 transition ${expanded ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Employee Badges */}
        <div className="flex flex-wrap gap-3">
          {displayedEmployees.map((emp) => (
            <div
              key={emp.id}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border-2 border-gray-300"
            >
              <span className="font-medium text-gray-700">{emp.name}</span>
              <span className="text-gray-500 text-sm">{emp.empId}</span>
              <button
                onClick={() => setShowRemoveConfirm(emp.id)}
                className="text-gray-400 hover:text-red-500 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Unassign Employee Dialog */}
        <Dialog
          open={!!showRemoveConfirm}
          onOpenChange={(open) => !open && setShowRemoveConfirm(null)}
        >
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-[#690003]">Unassign Employee?</DialogTitle>
              <DialogDescription>
                Are you sure you want to unassign this employee from this task?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRemoveConfirm(null)}
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (showRemoveConfirm) {
                    onRemoveAssignment(task.id, showRemoveConfirm);
                    setShowRemoveConfirm(null);
                  }
                }}
                className="bg-[#690003] hover:bg-[#8B0000] text-white"
              >
                Unassign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-[#690003]">Delete Task?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this task and unassign all employees? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (onDeleteTask) {
                    onDeleteTask(task.id);
                  }
                  setShowDeleteConfirm(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Task Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="bg-[#FBF4E8] max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-[#690003]">Edit Task</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Task Info (Read-only display) */}
              <div className="bg-white rounded-xl p-4 border-2 border-gray-300">
                <h4 className="text-lg font-bold text-[#690003] mb-2">{task.taskName}</h4>
                <p className="text-sm text-gray-600">{task.points}pts / client</p>
              </div>

              {/* Max Repeats */}
              <div className="flex items-center gap-4">
                <label className="font-bold text-[#690003]">Max Repeats</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditMaxAttempts(Math.max(1, editMaxAttempts - 1))}
                    className="bg-[#690003] text-white w-8 h-8 rounded flex items-center justify-center hover:bg-[#8B0000]"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-bold">{editMaxAttempts}</span>
                  <button
                    onClick={() => setEditMaxAttempts(editMaxAttempts + 1)}
                    className="bg-[#690003] text-white w-8 h-8 rounded flex items-center justify-center hover:bg-[#8B0000]"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-4">
                <label className="font-bold text-[#690003]">Due Date</label>
                <DatePickerPopover
                  deadline={editDueDate}
                  onDeadlineChange={(date) => date && setEditDueDate(date)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditTask}
                className="bg-[#690003] hover:bg-[#8B0000] text-white"
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
