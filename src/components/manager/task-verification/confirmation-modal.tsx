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

  const title = type === 'approve' ? 'Confirm Approval' : type === 'deny' ? 'Confirm Denial' : '';
  const isRequired = type === 'deny';

  const handleConfirm = () => {
    if (isProcessing) return;

    if (isRequired && !remark.trim()) {
      setError('Remarks are required for denial');
      return;
    }

    setError('');
    onConfirm(remark);
    setRemark('');
  };

  const handleCancel = () => {
    setRemark('');
    setError('');
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !newOpen && handleCancel()}>
      <DialogContent className="max-w-[95vw] sm:max-w-md lg:max-w-lg xl:max-w-xl bg-card">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-background-soft border border-accent/50 rounded-lg p-4">
            <p className="font-bold">
              This action is permanent. Are you sure you want to proceed?
            </p>
          </div>

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
                if (error) setError('');
              }}
              disabled={isProcessing}
              className="min-h-24 resize-none disabled:opacity-50 disabled:cursor-not-allowed bg-background-soft border border-accent/50"
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
          <Button
            variant={type === 'approve' ? 'default' : 'destructive'}
            onClick={handleConfirm}
            disabled={isProcessing}
            className={type === 'approve' ? 'bg-foreground hover:bg-accent transition-all duration-400 ease-in-out' : ''}
          >
            {isProcessing ? 'Processing...' : 'Confirm'}
          </Button>
          <Button variant="outline" onClick={handleCancel} disabled={isProcessing} className='bg-card border border-primary/50 hover:bg-card hover:brightness-85 transition-all duration-400 ease-in-out'>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
