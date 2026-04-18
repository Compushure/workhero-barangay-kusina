'use client';

// Confirm dialog for toggling item visibility without deleting data.

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EyeOff, Eye, X } from 'lucide-react';

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
      <DialogContent
        showCloseButton={false}
        className="bg-card text-card-foreground border border-accent/25 max-w-md rounded-3xl p-6 shadow-xl"
      >
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onOpenChange(false);
          }}
          className="absolute right-4 top-4 rounded-full border border-transparent bg-white/20 p-1 text-muted-foreground shadow-sm/25 transition-all duration-200 hover:bg-accent-secondary/15 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <X className="h-5 w-5 text-muted-foreground" />
          <span className="sr-only">Close</span>
        </button>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              {isHidden ? (
                <Eye className="h-6 w-6 text-primary" />
              ) : (
                <EyeOff className="h-6 w-6 text-primary" />
              )}
            </div>
            <DialogTitle className="text-h2 text-foreground">
              {isHidden ? 'Unhide Item' : 'Hide Item'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-meta text-muted-foreground">
            {isHidden
              ? 'This item will be visible to employees in the Mercado.'
              : 'This item will be hidden from employees in the Mercado.'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {/* Primary action toggles hidden/visible state. */}
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="control-h rounded-xl bg-primary-gradient text-button text-white shadow-sm/25 transition-all duration-300 hover:brightness-95"
          >
            {isHidden ? 'Unhide' : 'Hide'}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="control-h rounded-xl border border-gray-300 text-button text-foreground transition-all duration-300 hover:bg-gray-200 hover:text-foreground"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
