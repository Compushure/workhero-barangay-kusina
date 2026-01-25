'use client';

import { Trash2, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName?: string;
  onConfirm?: () => void;
}

export function DeleteModal({ open, onOpenChange, itemName, onConfirm }: DeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm?.();
    } finally {
      setIsDeleting(false);
    }
    onOpenChange(false);
  };

  const handleClose = () => {
    if (!isDeleting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#f5e5dc] border-none max-w-lg rounded-3xl p-8">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 text-[#5a2a2a] hover:text-[#690003] transition-colors"
        ></button>

        {/* Trash Icon */}
        <div className="flex justify-start mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="h-8 w-8 text-[#8b0000]" />
          </div>
        </div>

        {/* Content */}
        <DialogHeader className="space-y-4 text-left">
          <DialogTitle className="text-2xl font-bold text-[#2d2d2d]">Delete Reward</DialogTitle>
          <DialogDescription className="text-[#6b6b6b] text-base leading-relaxed">
            Are you sure you want to delete this reward? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            className="flex-1 bg-white text-[#2d2d2d] border-2 border-gray-300 hover:bg-gray-50 py-6 text-lg font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 bg-[#690003] text-white hover:bg-[#8b0000] py-6 text-lg font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
