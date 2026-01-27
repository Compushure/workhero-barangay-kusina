import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ClearSelectionDialogProps {
  showClearConfirm: boolean, 
  setShowClearConfirm: (show: boolean) => void, 
  handleClear: () => void
}

function ClearSelectionDialog({showClearConfirm, setShowClearConfirm, handleClear} : ClearSelectionDialogProps) {
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
            variant="outline"
            onClick={() => setShowClearConfirm(false)}
            className="border-gray-300"
          >
            Cancel
          </Button>
          <Button onClick={handleClear} className="bg-[#690003] hover:bg-[#8B0000] text-white">
            Clear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ClearSelectionDialog;