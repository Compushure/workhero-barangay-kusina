'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AssignEmployeesDialog } from './dialogs/assign-employees-dialog';
import { SelectTasksDialog } from './dialogs/select-tasks-dialog';
import { DatePickerPopover } from './date-picker-popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { SelectedFilters, AssignedEmployee } from './task-assignment-page';

interface TaskAssignmentCardProps {
  onAssign: (filters: SelectedFilters) => void;
}

export function TaskAssignmentCard({ onAssign }: TaskAssignmentCardProps) {
  const [selectedEmployees, setSelectedEmployees] = useState<AssignedEmployee[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedDeadline, setSelectedDeadline] = useState<Date | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleAssign = () => {
    if (selectedEmployees.length > 0 && selectedTasks.length > 0 && selectedDeadline) {
      onAssign({
        employees: selectedEmployees,
        tasks: selectedTasks,
        deadline: selectedDeadline,
      });
      handleClear();
    }
  };

  const handleClear = () => {
    setSelectedEmployees([]);
    setSelectedTasks([]);
    setSelectedDeadline(null);
    setShowClearConfirm(false);
  };

  return (
    <div className="rounded-3xl bg-[#FBF4E8] p-8 shadow-sm">
      <h2 className="mb-8 text-2xl font-bold text-[#690003]">Assign Employees for Task</h2>

      <div className="flex flex-wrap gap-4 mb-8">
        {/* Select Employees Button */}
        <AssignEmployeesDialog
          selectedEmployees={selectedEmployees}
          onEmployeesChange={setSelectedEmployees}
        />

        {/* Select Tasks Button */}
        <SelectTasksDialog
          selectedTasks={selectedTasks}
          onTasksChange={setSelectedTasks}
          mode="assign"
        />

        {/* Set Deadline */}
        <DatePickerPopover deadline={selectedDeadline} onDeadlineChange={setSelectedDeadline} />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button
          variant="outline"
          onClick={() => setShowClearConfirm(true)}
          className="border-gray-300 text-gray-700 bg-zinc-50 hover:bg-zinc-200 px-12"
        >
          Clear
        </Button>
        <Button
          onClick={handleAssign}
          disabled={
            selectedEmployees.length === 0 || selectedTasks.length === 0 || !selectedDeadline
          }
          className="bg-[#690003] hover:bg-[#8B0000] text-white disabled:opacity-50 disabled:cursor-not-allowed px-12"
        >
          Assign
        </Button>
      </div>

      {/* Clear Confirmation Dialog */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#690003]">Clear Selection?</DialogTitle>
            <DialogDescription>
              This will clear all selected employees, tasks, and deadline.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowClearConfirm(false)}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button onClick={handleClear} className="bg-[#690003] hover:bg-[#8B0000] text-white">
              Clear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
