'use client';

import { FileIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface HideRewardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isHidden?: boolean;
}

export function HideRewardDialog({
  open,
  onOpenChange,
  onConfirm,
  isHidden,
}: HideRewardDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="items-center space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <FileIcon className="h-6 w-6 text-orange-600" />
          </div>
          <div className="space-y-2 text-center">
            <DialogTitle className="text-xl font-semibold">
              {isHidden ? 'Unhide Reward?' : 'Hide Reward?'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {isHidden
                ? 'Are you sure? This action will make the reward visible to employees again.'
                : 'Are you sure? This action will prevent employees from viewing and interacting with the reward.'}
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="flex-row gap-2 sm:justify-center">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="flex-1 bg-red-700 hover:bg-red-800">
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
