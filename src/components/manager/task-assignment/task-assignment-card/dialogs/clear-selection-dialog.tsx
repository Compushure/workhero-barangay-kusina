import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

interface ClearSelectionDialogProps {
  showClearConfirm: boolean;
  setShowClearConfirm: (show: boolean) => void;
  handleClear: () => void;
}

function ClearSelectionDialog({
  showClearConfirm,
  setShowClearConfirm,
  handleClear,
}: ClearSelectionDialogProps) {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearSelection = async () => {
    if (isClearing) return;
    setIsClearing(true);
    try {
      await handleClear();
    } finally {
      setIsClearing(false);
      setShowClearConfirm(false);
    }
  };

  return (
    <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#690003]">Clear Selection?</DialogTitle>
          <DialogDescription>
            This will clear all selected employees, tasks, and deadline.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={handleClearSelection}
            disabled={isClearing}
            className="bg-[#690003] hover:bg-red-700 text-white cursor-pointer transition-all duration-500 ease-in-out"
          >
            {isClearing ? 'Clearing...' : 'Clear'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowClearConfirm(false)}
            disabled={isClearing}
            className="border-gray-300 hover:bg-gray-200 cursor-pointer transition-all duration-500 ease-in-out"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ClearSelectionDialog;
