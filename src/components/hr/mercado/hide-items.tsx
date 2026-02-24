'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EyeOff, Eye } from 'lucide-react';

interface HideRewardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isHidden: boolean;
}

export function HideRewardDialog({
  open,
  onOpenChange,
  onConfirm,
  isHidden,
}: HideRewardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-[#f2e1c9] flex items-center justify-center">
              {isHidden ? (
                <Eye className="h-6 w-6 text-[#730202]" />
              ) : (
                <EyeOff className="h-6 w-6 text-[#730202]" />
              )}
            </div>
            <DialogTitle className="text-xl font-bold text-[#730202]">
              {isHidden ? 'Unhide Item' : 'Hide Item'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-base text-[#730202]/70">
            {isHidden
              ? 'This item will be visible to employees in the Mercado.'
              : 'This item will be hidden from employees in the Mercado.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 rounded-xl border-[#730202]/20 text-[#730202] hover:bg-[#f2e1c9] font-semibold text-base"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="h-11 rounded-xl bg-[#730202] hover:bg-[#730202]/90 text-white font-semibold text-base"
          >
            {isHidden ? 'Unhide' : 'Hide'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
