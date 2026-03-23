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

export function ConfirmationDialog({
  open,
  type,
  onCancel,
  onConfirm,
  isProcessing = false,
}: ConfirmationDialogProps) {
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
      <DialogContent className="max-w-[95vw] sm:max-w-md lg:max-w-lg bg-card p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-base text-foreground">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm font-bold text-red-900">
              This action is permanent. Are you sure you want to proceed?
            </p>
          </div>

          {/* Remarks Textarea */}
          <div className="space-y-1.5">
            <Label htmlFor="remarks" className="text-xs font-medium">
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
              className="min-h-20 resize-none disabled:opacity-50 disabled:cursor-not-allowed bg-background-soft border border-accent/50 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
              aria-required={isRequired}
              aria-invalid={!!error}
              aria-describedby={error ? 'remark-error' : undefined}
            />
            {error && (
              <p id="remark-error" className="text-xs text-red-600">
                {error}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="mt-3 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isDisabled}
            className="h-8 text-xs px-3 !bg-card !text-foreground border-zinc-400 hover:!bg-[#fafafa] hover:!text-foreground hover:brightness-90 cursor-pointer transition-all duration-400 ease-in-out"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={isDisabled}
            className={`h-8 text-xs px-3 cursor-pointer transition-all duration-400 ease-in-out ${
              type === 'approve'
                ? 'bg-primary-gradient hover:bg-primary-gradient hover:brightness-85 text-card'
                : 'bg-red-700 hover:bg-red-500 text-white'
            }`}
          >
            {isProcessing || isConfirming ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
