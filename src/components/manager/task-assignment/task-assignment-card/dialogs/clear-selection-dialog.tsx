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
      <DialogContent className="max-w-[90vw] sm:max-w-sm md:max-w-md lg:max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">Clear Selection?</DialogTitle>
          <DialogDescription>
            This will clear all selected employees, tasks, and deadline.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={handleClearSelection}
            disabled={isClearing}
            className="bg-primary-gradient hover:bg-primary-gradient hover:brightness-85 text-card cursor-pointer transition-all duration-500 ease-in-out px-6 shadow-sm/25"
          >
            {isClearing ? 'Clearing...' : 'Confirm'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowClearConfirm(false)}
            disabled={isClearing}
            className="border-gray-400 bg-card text-foreground hover:bg-[#fafafa] hover:brightness-90 hover:text-foreground cursor-pointer transition-all duration-500 ease-in-out shadow-sm/25"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ClearSelectionDialog;
