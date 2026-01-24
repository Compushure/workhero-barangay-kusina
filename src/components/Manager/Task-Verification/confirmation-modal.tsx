'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ConfirmationDialogProps {
  open: boolean;
  type: 'approve' | 'deny' | null;
  onCancel: () => void;
  onConfirm: (remark: string) => void;
}

export function ConfirmationDialog({ open, type, onCancel, onConfirm }: ConfirmationDialogProps) {
  const [remark, setRemark] = useState('');
  const [error, setError] = useState('');

  const title = type === 'approve' ? 'Confirm Approval' : type === 'deny' ? 'Confirm Denial' : '';
  const isRequired = type === 'deny';

  const handleConfirm = () => {
    // Validate remarks for deny action
    if (isRequired && !remark.trim()) {
      setError('Remarks are required for denial');
      return;
    }

    // Clear error and trigger callback
    setError('');
    onConfirm(remark);
    setRemark('');
  };

  const handleCancel = () => {
    setRemark('');
    setError('');
    onCancel();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      handleCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="font-bold text-red-900">
              This action is permanent. Are you sure you want to proceed?
            </p>
          </div>

          {/* Remarks Textarea */}
          <div className="space-y-2">
            <Label htmlFor="remarks" className="text-sm font-medium">
              Remarks {isRequired && <span className="text-red-600">*</span>}
            </Label>
            <Textarea
              id="remarks"
              placeholder={
                type === 'deny'
                  ? 'Enter remarks explaining the denial (required)'
                  : 'Enter remarks (optional)'
              }
              value={remark}
              onChange={(e) => {
                setRemark(e.target.value);
                if (error) setError(''); // Clear error on input
              }}
              className="min-h-24 resize-none"
              aria-required={isRequired}
              aria-invalid={!!error}
              aria-describedby={error ? 'remark-error' : undefined}
            />
            {error && (
              <p id="remark-error" className="text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant={type === 'approve' ? 'default' : 'destructive'}
            onClick={handleConfirm}
            className={type === 'approve' ? 'bg-[#690003] hover:bg-[#af3b3f]' : ''}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
