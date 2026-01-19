'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface RemarksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (remarks?: string) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  maxLength?: number;
  placeholder?: string;
  required?: boolean;
  confirmVariant?: 'default' | 'destructive';
}

export function RemarksDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Decline (Optional Remark)',
  description = 'If you wish to continue with the confirmation without any remarks, simply click OK.',
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  maxLength = 500,
  placeholder = 'Type in remarks/comments you wish to send alongside the request confirmation.',
  required = false,
  confirmVariant = 'default',
}: RemarksDialogProps) {
  const [remarks, setRemarks] = useState('');

  const handleConfirm = () => {
    if (required && !remarks.trim()) {
      return;
    }
    onConfirm(remarks.trim() || undefined);
    setRemarks('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setRemarks('');
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setRemarks('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          <Textarea
            value={remarks}
            onChange={(e) => {
              if (e.target.value.length <= maxLength) {
                setRemarks(e.target.value);
              }
            }}
            placeholder={placeholder}
            className="min-h-[120px] resize-none"
            maxLength={maxLength}
          />
          <div className="flex justify-end text-xs text-muted-foreground">
            {remarks.length}/{maxLength}
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-center">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 sm:flex-none sm:min-w-[120px]"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={required && !remarks.trim()}
            className={`flex-1 sm:flex-none sm:min-w-[120px] ${
              confirmVariant === 'destructive' || confirmLabel === 'OK'
                ? 'bg-[#690003] hover:bg-[#8B0000]'
                : ''
            }`}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Example usage patterns:

/**
 * Basic decline with optional remarks:
 *
 * const [remarksOpen, setRemarksOpen] = useState(false);
 *
 * <RemarksDialog
 *   open={remarksOpen}
 *   onOpenChange={setRemarksOpen}
 *   onConfirm={(remarks) => {
 *     declineMutation.mutate({ id: requestId, remarks });
 *   }}
 * />
 */

/**
 * Required remarks for rejection:
 *
 * <RemarksDialog
 *   open={remarksOpen}
 *   onOpenChange={setRemarksOpen}
 *   onConfirm={(remarks) => {
 *     rejectMutation.mutate({ id: requestId, remarks });
 *   }}
 *   title="Reject Request"
 *   description="Please provide a reason for rejecting this request."
 *   confirmLabel="Reject"
 *   required={true}
 *   confirmVariant="destructive"
 * />
 */

/**
 * Approval with optional comments:
 *
 * <RemarksDialog
 *   open={remarksOpen}
 *   onOpenChange={setRemarksOpen}
 *   onConfirm={(remarks) => {
 *     approveMutation.mutate({ id: requestId, comments: remarks });
 *   }}
 *   title="Approve Request"
 *   description="Add any additional comments to this approval (optional)."
 *   confirmLabel="Approve"
 *   placeholder="Add any notes or comments..."
 * />
 */
