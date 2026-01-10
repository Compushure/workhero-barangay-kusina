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

interface AddEmployeeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectEmployee: (employee: string) => void;
  selectedEmployees: string[];
}

// Mock employee list
const EMPLOYEES = [
  'Juan Dela Cruz',
  'MJ Lip',
  'Richard Becerra',
  'Herbert M. Brown',
  'Sarah Johnson',
  'Michael Chen',
];

export function AddEmployeeDialog({
  isOpen,
  onOpenChange,
  onSelectEmployee,
  selectedEmployees,
}: AddEmployeeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-6 rounded-full border border-gray-300 bg-white px-6 text-[#690003] stroke: shadow-sm transition-colors hover:bg-gray-50">
          <span>Add Employee</span>
          <CirclePlus size={18} />
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
          <DialogDescription>Select an employee to add to this task assignment.</DialogDescription>
        </DialogHeader>
        {/* Dialog content will be customized by user */}
        <div className="space-y-2">
          {EMPLOYEES.map((employee) => (
            <Button
              key={employee}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => onSelectEmployee(employee)}
              disabled={selectedEmployees.includes(employee)}
            >
              {employee}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
