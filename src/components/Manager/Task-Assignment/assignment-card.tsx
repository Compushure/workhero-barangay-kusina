'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AddEmployeeDialog } from './dialogs/add-employee-dialog';
import { SelectTaskDialog } from './dialogs/select-task-dialog';
import { DeadlinePopover } from './deadline-popover';

interface AssignmentCardProps {
  selectedEmployees: string[];
  selectedTask: string | null;
  selectedDeadline: Date | null;
  onEmployeesChange: (employees: string[]) => void;
  onTaskChange: (task: string | null) => void;
  onDeadlineChange: (date: Date | null) => void;
}

export function AssignmentCard({
  selectedEmployees,
  selectedTask,
  selectedDeadline,
  onEmployeesChange,
  onTaskChange,
  onDeadlineChange,
}: AssignmentCardProps) {
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isSelectTaskOpen, setIsSelectTaskOpen] = useState(false);

  const handleAddEmployee = (employee: string) => {
    if (!selectedEmployees.includes(employee)) {
      onEmployeesChange([...selectedEmployees, employee]);
    }
    setIsAddEmployeeOpen(false);
  };

  const handleSelectTask = (task: string) => {
    onTaskChange(task);
    setIsSelectTaskOpen(false);
  };

  const handleClear = () => {
    onEmployeesChange([]);
    onTaskChange(null);
    onDeadlineChange(null);
  };

  const isAssignDisabled = selectedEmployees.length === 0 || !selectedTask || !selectedDeadline;

  return (
    <div className="mb-8 rounded-3xl bg-[#FBF4E8] p-8 shadow-xs/25">
      <h2 className="mb-6 text-xl font-bold text-[#690003]">Assign Employees for Task</h2>

      <div className="mb-8 flex gap-4">
        {/* Add Employee Button/Dialog Trigger */}
        <AddEmployeeDialog
          isOpen={isAddEmployeeOpen}
          onOpenChange={setIsAddEmployeeOpen}
          onSelectEmployee={handleAddEmployee}
          selectedEmployees={selectedEmployees}
        />

        {/* Select Task Button/Dialog Trigger */}
        <SelectTaskDialog
          isOpen={isSelectTaskOpen}
          onOpenChange={setIsSelectTaskOpen}
          onSelectTask={handleSelectTask}
          selectedTask={selectedTask}
        />

        {/* Set Deadline Popover */}
        <DeadlinePopover selectedDate={selectedDeadline} onDateChange={onDeadlineChange} />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={handleClear}
          className="px-8 text-gray-600 bg-transparent"
        >
          Clear
        </Button>
        <Button
          onClick={() => {
            // Handle assignment logic here
            console.log({
              employees: selectedEmployees,
              task: selectedTask,
              deadline: selectedDeadline,
            });
          }}
          disabled={isAssignDisabled}
          className="bg-[#690003] px-8 text-white hover:bg-[#550002]"
        >
          Assign
        </Button>
      </div>
    </div>
  );
}
