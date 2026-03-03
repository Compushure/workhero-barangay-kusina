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
      <DialogContent className="bg-card text-card-foreground border border-border max-w-md rounded-2xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
              {isHidden ? (
                <Eye className="h-6 w-6 text-primary" />
              ) : (
                <EyeOff className="h-6 w-6 text-primary" />
              )}
            </div>
            <DialogTitle className="text-xl font-bold text-primary">
              {isHidden ? 'Unhide Item' : 'Hide Item'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-base text-muted-foreground">
            {isHidden
              ? 'This item will be visible to employees in the Mercado.'
              : 'This item will be hidden from employees in the Mercado.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 rounded-xl border-border text-foreground hover:bg-muted font-semibold text-base"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base"
          >
            {isHidden ? 'Unhide' : 'Hide'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
