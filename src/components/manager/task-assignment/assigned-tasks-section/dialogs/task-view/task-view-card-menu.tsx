'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';

interface TaskViewCardMenuProps {
  openPopover: boolean;
  setOpenPopover: (open: boolean) => void;
  handleOpenEditDialog: () => void;
  setShowDeleteConfirm: (show: boolean) => void;
}

export default function TaskViewCardMenu({
  openPopover,
  setOpenPopover,
  handleOpenEditDialog,
  setShowDeleteConfirm,
}: TaskViewCardMenuProps) {
  return (
    <Popover open={openPopover} onOpenChange={setOpenPopover}>
      <PopoverTrigger asChild>
        <button className="text-primary rounded-full py-0.5 hover:text-accent hover:bg-accent-secondary/25 hover:scale-110 transition-all duration-400 ease-in-out cursor-pointer">
          <MoreVertical className="size-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-32 p-1.5 bg-card" align="end">
        <div className="flex flex-col gap-0.5">
          <Button
            onClick={handleOpenEditDialog}
            variant="ghost"
            className="justify-start text-foreground hover:bg-accent-secondary/25 hover:text-foreground cursor-pointer transition-all duration-400 ease-in-out"
          >
            Edit Task
          </Button>
          <Button
            onClick={() => {
              setShowDeleteConfirm(true);
              setOpenPopover(false);
            }}
            variant="ghost"
            className="justify-start text-red-600 hover:text-red-600 hover:bg-accent-secondary/25 cursor-pointer transition-all duration-500 ease-in-out"
          >
            Delete Task
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
