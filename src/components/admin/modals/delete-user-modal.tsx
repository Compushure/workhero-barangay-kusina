/**
 * Delete User Modal Component
 * ============================
 * Confirmation dialog for user deletion.
 * Displays warning and requires explicit confirmation before proceeding.
 */

'use client';

import { useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  onConfirm: () => Promise<boolean>;
}

export function DeleteUserModal({ open, onOpenChange, userName, onConfirm }: DeleteUserModalProps) {
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      await onConfirm();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card w-[95vw] max-w-md mx-auto rounded-xl border border-gray-300 shadow-sm/25">
        <DialogHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">Delete User</DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 px-3 sm:px-4 bg-background rounded-lg border border-gray-300 shadow-sm/25">
          <p className="text-sm text-foreground">
            Are you sure you want to delete <strong className="text-foreground">{userName}</strong>?
          </p>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            All associated data will be permanently removed from the system.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
            className="flex-1 bg-destructive cursor-pointer text-white hover:bg-destructive/90 transition-all duration-500 ease-in-out shadow-sm/25"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="flex-1 border-zinc-300 bg-white cursor-pointer text-foreground hover:bg-gray-100 hover:text-foreground transition-all duration-500 ease-in-out"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
