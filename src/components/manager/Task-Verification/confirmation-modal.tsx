'use client';

import { useState, useRef } from 'react';
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
  isProcessing?: boolean;
}

export function ConfirmationDialog({ open, type, onCancel, onConfirm, isProcessing = false }: ConfirmationDialogProps) {
  const [remark, setRemark] = useState('');
  const [error, setError] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const isSubmittingRef = useRef(false);

  const title = type === 'approve' ? 'Confirm Approval' : type === 'deny' ? 'Confirm Denial' : '';
  const isRequired = type === 'deny';
  
  // Disable if either the modal's internal state OR the parent's processing state is true
  const isDisabled = isConfirming || isProcessing;

  const handleConfirm = () => {
    // Prevent multiple submissions using ref (synchronous check)
    if (isSubmittingRef.current || isProcessing) return;

    // Validate remarks for deny action
    if (isRequired && !remark.trim()) {
      setError('Remarks are required for denial');
      return;
    }

    // Mark as submitting immediately (synchronous)
    isSubmittingRef.current = true;
    setIsConfirming(true);

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
      isSubmittingRef.current = false; // Reset ref when dialog closes
      handleCancel();
      setIsConfirming(false); // Reset confirming state when dialog closes
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
              disabled={isDisabled}
              className="min-h-24 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
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
          <Button variant="outline" onClick={handleCancel} disabled={isDisabled}>
            Cancel
          </Button>
          <Button
            variant={type === 'approve' ? 'default' : 'destructive'}
            onClick={handleConfirm}
            disabled={isDisabled}
            className={type === 'approve' ? 'bg-[#690003] hover:bg-[#af3b3f]' : ''}
          >
            {isProcessing || isConfirming ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
