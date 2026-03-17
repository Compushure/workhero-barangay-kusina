'use client';

import { useState, useRef } from 'react';
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
  description = 'If you wish to continue with the confirmation without any remarks, simply click OK.',
  confirmLabel = 'OK',
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
    setRemarks('');
    setError('');
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setRemarks('');
      setError('');
      setIsConfirming(false); // Reset confirming state when dialog closes
      isSubmittingRef.current = false; // Reset ref when dialog closes
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
            variant="outline"
            onClick={handleCancel}
            disabled={isDisabled}
            className="control-h flex-1 rounded-full border border-accent/25 bg-transparent text-button text-foreground shadow-sm/25 transition-all duration-300 hover:bg-accent-secondary/10"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            variant={confirmVariant}
            className={`flex-1 rounded-3xl ${
              confirmVariant === 'default'
                ? 'bg-primary-gradient text-white shadow-sm/25 transition-all duration-300 hover:opacity-95'
                : confirmVariant === 'destructive'
                  ? 'bg-destructive text-destructive-foreground transition-all duration-300 hover:bg-destructive/90'
                  : ''
            }`}
          >
            {isProcessing ? 'Processing...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
