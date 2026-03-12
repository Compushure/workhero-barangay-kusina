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
import { normalizeSearchQuery, sanitizeSearchInput } from '@/lib/utils/search-normalization';

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

  const activeStatuses = useMemo(() => new Set(['assigned', 'in review', 'rejected']), []);

  const disabledEmployeeIds = useMemo(() => {
    const disabledIds = new Set<string>();

    selectedTaskIds.forEach((taskId) => {
      assignedTasks.forEach((assignedTask) => {
        if (assignedTask.taskId === taskId) {
          const taskStatus = (assignedTask.status ?? '').toLowerCase();

          assignedTask.assignedEmployees.forEach((emp) => {
            const employeeStatus = (emp.status ?? taskStatus ?? '').toLowerCase();
            if (activeStatuses.has(employeeStatus)) {
              disabledIds.add(emp.id);
            }
          });
        }
      });
    });

    return disabledIds;
  }, [activeStatuses, assignedTasks, selectedTaskIds]);

  useEffect(() => {
    async function loadEmployees() {
      const data = await handleFetchEmployeeList();
      setEmployees(data);
      setIsLoading(false);
    }
    loadEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    const searchLower = normalizeSearchQuery(searchTerm);
    return employees.filter(
      (emp) =>
        !searchLower ||
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
        className={`w-full sm:w-auto bg-zinc-50 transform-gpu shadow-sm/25 cursor-pointer transition-all duration-400 ease-in-out flex items-center 
          disabled:shadow hover:bg-accent/15 disabled:cursor-not-allowed h-7 text-xs`}
      >
        <div className="flex items-center gap-2 min-w-0 sm:min-w-40 max-w-full sm:max-w-70 max-9/10">
          <Users size={14} className="text-accent" />
          <span
            className={`truncate ${selectedEmployees.length === 0 ? 'text-secondary' : 'text-primary'}`}
          >
            {selectedEmployees.length} employee/s selected
          </span>
        </div>
        <Plus className="size-3.5 text-primary" />
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="bg-card max-w-[95vw] sm:max-w-lg lg:max-w-xl max-h-[90vh] flex flex-col rounded-3xl p-3 sm:p-4 pt-8 sm:pt-10">
          <DialogHeader>
            <DialogTitle className="flex gap-2 text-base sm:text-lg text-foreground text-left items-center">
              <Users className="size-6 p-1 bg-primary-gradient text-card rounded-full" />
              Assign Employees for Task
            </DialogTitle>
          </DialogHeader>

          {/* Search Bar */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee name or employee ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(sanitizeSearchInput(e.target.value))}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full bg-card shadow-sm/25 focus:outline-none focus:border focus:border-accent"
            />
          </div>

          {/* Employees Selected Badge */}
          <div className="mb-0.5">
            <h4 className="text-base font-bold text-foreground">
              Employees Selected{' '}
              <span className="bg-accent text-card px-2 py-0.5 rounded-full text-xs ml-1 shadow-sm/25">
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
              className="w-full sm:w-auto px-4 sm:px-8 bg-card text-foreground hover:bg-accent hover:text-card cursor-pointer transition-all duration-400 ease-in-out h-8 text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
