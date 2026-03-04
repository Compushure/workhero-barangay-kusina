'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Search, Plus, Users } from 'lucide-react';
import type { AssignedEmployee, AssignedTask } from '@/types';
import AssignEmployeesTable from './assign-employees-table';
import { handleFetchEmployeeList } from '@/action-handlers/manager/assignments';

interface AssignEmployeesDialogProps {
  selectedEmployees: AssignedEmployee[];
  onEmployeesChange: (employees: AssignedEmployee[]) => void;
  disabled?: boolean;
  selectedTaskIds?: string[];
  assignedTasks?: AssignedTask[];
}

export function AssignEmployeesDialog({
  selectedEmployees,
  onEmployeesChange,
  disabled = false,
  selectedTaskIds = [],
  assignedTasks = [],
}: AssignEmployeesDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<AssignedEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const disabledEmployeeIds = useMemo(() => {
    const disabledIds = new Set<string>();

    selectedTaskIds.forEach((taskId) => {
      assignedTasks.forEach((assignedTask) => {
        if (assignedTask.taskId === taskId) {
          assignedTask.assignedEmployees.forEach((emp) => {
            disabledIds.add(emp.id);
          });
        }
      });
    });

    return disabledIds;
  }, [assignedTasks, selectedTaskIds]);

  useEffect(() => {
    async function loadEmployees() {
      const data = await handleFetchEmployeeList();
      setEmployees(data);
      setIsLoading(false);
    }
    loadEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(searchLower) ||
        emp.empId.toLowerCase().includes(searchLower)
    );
  }, [employees, searchTerm]);

  const allFilteredSelected = useMemo(() => {
    if (filteredEmployees.length === 0) return false;
    return filteredEmployees.every((emp) => selectedEmployees.find((e) => e.id === emp.id));
  }, [filteredEmployees, selectedEmployees]);

  const toggleEmployee = (employee: AssignedEmployee) => {
    const isSelected = selectedEmployees.find((e) => e.id === employee.id);
    if (isSelected) {
      onEmployeesChange(selectedEmployees.filter((e) => e.id !== employee.id));
    } else {
      onEmployeesChange([...selectedEmployees, employee]);
    }
  };

  const handleSelectAll = () => {
    if (allFilteredSelected) {
      // Deselect all filtered employees
      const filteredIds = new Set(filteredEmployees.map((e) => e.id));
      onEmployeesChange(selectedEmployees.filter((emp) => !filteredIds.has(emp.id)));
    } else {
      // Select all filtered employees (excluding disabled ones)
      const newSelections = filteredEmployees.filter(
        (emp) => !selectedEmployees.find((e) => e.id === emp.id) && !disabledEmployeeIds.has(emp.id)
      );
      onEmployeesChange([...selectedEmployees, ...newSelections]);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!disabled) {
      if (!newOpen) {
        setSearchTerm('');
      }
      setOpen(newOpen);
    }
  };

  return (
    <>
      <Button
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        className={`bg-zinc-50 transform-gpu shadow-sm/25 cursor-pointer transition-all duration-400 ease-in-out flex items-center 
          disabled:shadow hover:bg-accent/15 disabled:cursor-not-allowed`}
      >
        <div className="flex items-center gap-2 min-w-45 max-9/10">
          <Users size={16} className='text-accent'/>
          <span className={`${selectedEmployees.length === 0 ? 'text-secondary' : 'text-primary'}`}>
            {selectedEmployees.length} employee/s selected
          </span>
        </div>
        <Plus className="size-4 text-primary" />
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="bg-card max-h-[90vh] flex flex-col rounded-3xl pt-12">
          <DialogHeader>
            <DialogTitle className="flex gap-2 text-2xl text-foreground text-left items-center">
              <Users className='size-7 p-1.25 bg-primary-gradient text-card rounded-full'/>
              Assign Employees for Task
            </DialogTitle>
          </DialogHeader>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Enter in Employee Name or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-card shadow-sm/25 focus:outline-none focus:border focus:border-accent"
            />
          </div>

          {/* Employees Selected Badge */}
          <div className="mb-1">
            <h4 className="text-lg font-bold text-foreground">
              Employees Selected{' '}
              <span className="bg-accent text-card px-2.5 py-0.5 rounded-full text-sm ml-1 shadow-sm/25">
                {selectedEmployees.length}
              </span>
            </h4>
          </div>

          {/* Employees Table */}
          <AssignEmployeesTable
            isLoading={isLoading}
            allFilteredSelected={allFilteredSelected}
            handleSelectAll={handleSelectAll}
            filteredEmployees={filteredEmployees}
            selectedEmployees={selectedEmployees}
            toggleEmployee={toggleEmployee}
            disabledEmployeeIds={disabledEmployeeIds}
          />

          {/* Dialog Footer */}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="px-12 bg-card text-foreground hover:bg-accent hover:text-card cursor-pointer transition-all duration-400 ease-in-out"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
