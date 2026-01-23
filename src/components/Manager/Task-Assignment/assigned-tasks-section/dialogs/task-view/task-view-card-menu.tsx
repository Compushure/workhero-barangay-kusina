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
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical className="w-5 h-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-2" align="end">
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleOpenEditDialog}
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
  );
}