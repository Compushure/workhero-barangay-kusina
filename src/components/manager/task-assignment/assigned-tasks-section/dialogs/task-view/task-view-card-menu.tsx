'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';

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
        <button className="text-black hover:scale-110 transition-all duration-500 ease-in-out cursor-pointer">
<<<<<<< Updated upstream:src/components/manager/task-assignment/assigned-tasks-section/dialogs/task-view/task-view-card-menu.tsx
          <MoreVertical className="size-6" />
=======
          {/* <MoreVertical className="size-6" /> */}
>>>>>>> Stashed changes:src/components/Manager/Task-Assignment/assigned-tasks-section/dialogs/task-view/task-view-card-menu.tsx
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-2" align="end">
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleOpenEditDialog}
            variant="ghost"
            className="justify-start text-[#690003] hover:bg-red-50 cursor-pointer hover: transition-all duration-500 ease-in-out"
          >
            Edit Task
          </Button>
          <Button
            onClick={() => {
              setShowDeleteConfirm(true);
              setOpenPopover(false);
            }}
            variant="ghost"
            className="justify-start text-red-600 hover: transition-all duration-500 ease-in-out hover:bg-red-50 cursor-pointer"
          >
            Delete Task
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
