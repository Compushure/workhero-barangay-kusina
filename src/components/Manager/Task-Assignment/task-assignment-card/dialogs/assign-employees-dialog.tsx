'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Search, Plus } from 'lucide-react';
import { AssignedEmployee } from '../../task-assignment-page';
import { MOCK_EMPLOYEES } from '@/mock-data/employees';

interface AssignEmployeesDialogProps {
  selectedEmployees: AssignedEmployee[];
  onEmployeesChange: (employees: AssignedEmployee[]) => void;
  disabled?: boolean;
}

export function AssignEmployeesDialog({
  selectedEmployees,
  onEmployeesChange,
  disabled = false,
}: AssignEmployeesDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = MOCK_EMPLOYEES.filter((emp) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      emp.name.toLowerCase().includes(searchLower) || emp.empId.toLowerCase().includes(searchLower)
    );
  });

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
      // Select all filtered employees
      const newSelections = filteredEmployees.filter(
        (emp) => !selectedEmployees.find((e) => e.id === emp.id)
      );
      onEmployeesChange([...selectedEmployees, ...newSelections]);
    }
  };

  const handleConfirm = () => {
    setOpen(false);
    setSearchTerm('');
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
        className="bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2">
          <span>{selectedEmployees.length} selected</span>
          <Plus className="w-4 h-4" />
        </div>
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="bg-[#FBF4E8] max-h-[90vh] flex flex-col rounded-3xl pt-12">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#690003]">Assign Employees for Task</DialogTitle>
          </DialogHeader>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Enter in Employee Name or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border-2 border-white bg-white shadow-xs/25 focus:outline-none focus:border-2 focus:border-[#690003]"
            />
          </div>

          {/* Employees Selected Badge */}
          <div className="mb-1">
            <h4 className="text-lg font-bold text-[#690003]">
              Employees Selected{' '}
              <span className="bg-gray-50 px-2.5 py-0.5 rounded-full text-sm ml-1 shadow-xs/25">
                {selectedEmployees.length}
              </span>
            </h4>
          </div>

          {/* Employees Table */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 flex-1 flex flex-col overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr className="flex py-2 px-2 items-center">
                  <th className="p-2 flex w-[10%]">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={handleSelectAll}
                      className="w-5 h-5 rounded cursor-pointer accent-[#690003]"
                    />
                  </th>
                  <th className="w-[60%] px-3 text-left font-bold text-[#690003]">NAME</th>
                  <th className="w-[30%] px-5 text-left font-bold text-[#690003]">ID NO.</th>
                </tr>
              </thead>
              <tbody className="overflow-y-auto flex flex-col">
                {filteredEmployees.map((employee) => {
                  const isSelected = selectedEmployees.find((e) => e.id === employee.id);
                  return (
                    <tr
                      key={employee.id}
                      className="border-b border-gray-200 hover:bg-gray-50 flex w-full items-center py-1 cursor-pointer"
                      onClick={() => toggleEmployee(employee)}
                    >
                      <td className="p-4 flex w-[10%]">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={!!isSelected}
                            onChange={() => toggleEmployee(employee)}
                            className="w-5 h-5 rounded cursor-pointer accent-[#690003]"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </td>
                      <td className="flex w-[60%] px-4 font-medium text-gray-800">
                        {employee.name}
                      </td>
                      <td className="flex w-[30%] px-4 text-gray-600">{employee.empId}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Dialog Footer */}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Close
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedEmployees.length === 0}
              className="bg-[#690003] hover:bg-[#8B0000] text-white disabled:opacity-50"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
