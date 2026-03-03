'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName?: string;
  onConfirm: () => Promise<void> | void;
}

export function DeleteModal({ open, onOpenChange, itemName, onConfirm }: DeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border border-border max-w-md rounded-2xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold text-primary">Delete Item</DialogTitle>
          </div>
          <DialogDescription className="text-base text-muted-foreground">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-title">{itemName}</span>? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="h-11 rounded-xl border-border text-foreground hover:bg-muted font-semibold text-base"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
