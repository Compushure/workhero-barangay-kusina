'use client';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MoreVertical } from 'lucide-react';
import { AssignedEmployee } from '@/types';

interface EmployeeViewCardMenuProps {
  openPopoverId: string | null;
  setOpenPopoverId: (open: string | null) => void;
  employee: AssignedEmployee;
  setShowClearConfirm: (open: string | null) => void;
}

function EmployeeViewCardMenu({
  openPopoverId,
  setOpenPopoverId,
  employee,
  setShowClearConfirm,
}: EmployeeViewCardMenuProps) {
  return (
    <Popover
      open={openPopoverId === employee.id}
      onOpenChange={(open) => setOpenPopoverId(open ? employee.id : null)}
    >
      <PopoverTrigger asChild>
        <button className="text-primary rounded-full hover:text-accent hover:bg-accent-secondary/25 hover:scale-110 transition-all duration-500 ease-in-out cursor-pointer p-1 relative z-50">
          <MoreVertical className="size-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-32 p-1.5 z-100 bg-card" align="end">
        <div className="flex flex-col gap-1.5">
          <Button
            onClick={() => {
              setShowClearConfirm(employee.id);
              setOpenPopoverId(null);
            }}
            variant="ghost"
            className="justify-start text-red-600 hover:text-red-600 hover:bg-accent-secondary/25 cursor-pointer hover:transition-all duration-500 ease-in-out px-2"
          >
            Clear All Tasks
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default EmployeeViewCardMenu;
