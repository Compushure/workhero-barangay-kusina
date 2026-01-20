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
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (required && !remarks.trim()) {
      setError('Remarks are required for denial');
      return;
    }
    setError('');
    onConfirm(remarks.trim() || undefined);
    setRemarks('');
    onOpenChange(false);
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
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
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
              className="min-h-32 resize-none"
              maxLength={maxLength}
              aria-required={required}
              aria-invalid={!!error}
              aria-describedby={error ? 'remark-error' : undefined}
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
          <Button variant="outline" onClick={handleCancel} className="flex-1 rounded-3xl">
            {cancelLabel}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={required && !remarks.trim()}
            variant={confirmVariant}
            className={`flex-1 rounded-3xl ${
              confirmVariant === 'default' ? 'bg-[#690003] hover:bg-[#af3b3f]' : ''
            }`}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
