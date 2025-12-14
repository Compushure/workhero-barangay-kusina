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
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>This action cannot be undone</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 px-4 bg-destructive/5 rounded-lg border border-destructive/20">
          <p className="text-sm">
            Are you sure you want to delete <strong className="text-foreground">{userName}</strong>?
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            All associated data will be permanently removed from the system.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
            className="flex-1"
          >
            {isPending ? 'Deleting...' : 'Delete User'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
