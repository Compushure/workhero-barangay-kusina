'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
import { Label } from '@/components/ui/label';

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
  isProcessing?: boolean;
}

export function RemarksDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Decline (Optional Remark)',
  description = 'If you wish to continue with the confirmation without any remarks, simply click Confirm.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  maxLength = 500,
  placeholder = 'Type in remarks/comments you wish to send alongside the request confirmation.',
  required = false,
  confirmVariant = 'default',
  isProcessing = false,
}: RemarksDialogProps) {
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const isSubmittingRef = useRef(false);

  const resetDialogState = useCallback(() => {
    setRemarks('');
    setError('');
    setIsConfirming(false);
    isSubmittingRef.current = false;
  }, []);

  useEffect(() => {
    // Parent can close this controlled dialog directly, bypassing Dialog's onOpenChange callback.
    // Reset internal submit state whenever it transitions to closed.
    if (!open) {
      resetDialogState();
    }
  }, [open, resetDialogState]);

  // Disable if either the modal's internal state OR the parent's processing state is true
  const isDisabled = isConfirming || isProcessing;

  // Check if remarks are valid based on required prop
  const isRemarksValid = !required || remarks.trim().length > 0;

  // Disable confirm button if remarks are required but empty
  const isConfirmDisabled = isDisabled || !isRemarksValid;

  const handleConfirm = () => {
    // Validate required remarks
    if (required && remarks.trim().length === 0) {
      setError('Remarks are required when declining a request');
      return;
    }

    // Prevent multiple submissions using ref (synchronous check)
    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setIsConfirming(true);
    try {
      onConfirm(remarks.trim() || undefined);
    } catch (err) {
      isSubmittingRef.current = false;
      setIsConfirming(false);
    }
  };

  const handleCancel = () => {
    resetDialogState();
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetDialogState();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card text-card-foreground border border-accent/25 sm:max-w-md rounded-3xl shadow-xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-h2 text-foreground">{title}</DialogTitle>
          <DialogDescription className="text-meta text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Remarks Textarea */}
          <div className="space-y-2">
            {required && (
              <Label htmlFor="remarks" className="text-sm font-medium">
                Remarks <span className="text-red-600">*</span>
              </Label>
            )}
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => {
                if (e.target.value.length <= maxLength) {
                  setRemarks(e.target.value);
                  if (error) setError(''); // Clear error on input
                }
              }}
              placeholder={placeholder}
              className="min-h-32 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              maxLength={maxLength}
              aria-required={required}
              aria-invalid={!!error}
              aria-describedby={error ? 'remark-error' : undefined}
              disabled={isDisabled}
            />
            {error && (
              <p id="remark-error" className="text-sm text-red-600">
                {error}
              </p>
            )}
            <div className="flex justify-end text-xs text-muted-foreground">
              {remarks.length}/{maxLength}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-3">
          <Button
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            variant={confirmVariant}
            className={`control-h flex-1 cursor-pointer disabled:cursor-not-allowed ${
              confirmVariant === 'default'
                ? 'bg-primary-gradient text-card shadow-sm/25 transition-all duration-500 ease-in-out hover:bg-primary-gradient hover:brightness-85'
                : confirmVariant === 'destructive'
                  ? 'bg-red-700 text-card transition-all duration-500 ease-in-out hover:bg-red-500'
                  : ''
            }`}
          >
            {isProcessing ? 'Processing...' : confirmLabel}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isDisabled}
            className="control-h flex-1 cursor-pointer disabled:cursor-not-allowed bg-card text-button text-foreground shadow-sm/25 transition-all duration-500 ease-in-out hover:bg-[#fafafa] hover:text-foreground hover:brightness-90"
          >
            {cancelLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
