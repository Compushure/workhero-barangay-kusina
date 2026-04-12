'use client';

// Confirmation modal used before permanently deleting a Mercado item.

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
    // Runs parent delete action and locks UI while processing.
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
      <DialogContent className="bg-card text-card-foreground border border-accent/25 max-w-md rounded-3xl p-6 shadow-xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-h2 text-foreground">Delete Item</DialogTitle>
          </div>
          <DialogDescription className="text-meta text-muted-foreground">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-title">{itemName}</span>? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="control-h rounded-xl bg-destructive text-button text-destructive-foreground shadow-sm/25 transition-all duration-300 hover:bg-destructive/90"
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
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="control-h rounded-xl border border-gray-300 text-button text-foreground transition-all duration-300 hover:bg-gray-200 hover:text-foreground"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
