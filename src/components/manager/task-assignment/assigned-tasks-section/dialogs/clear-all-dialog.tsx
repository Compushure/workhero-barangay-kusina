import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ClearAllDialogProps {
  setShowClearConfirm: (show: boolean) => void, 
  onClearAll: () => void
}

function ClearAllDialog({ setShowClearConfirm, onClearAll } : ClearAllDialogProps) {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearAll = async () => {
    if (isClearing) return;
    setIsClearing(true);
    try {
      await onClearAll();
    } finally {
      setIsClearing(false);
      setShowClearConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-sm shadow-lg">
        <h3 className="text-lg font-bold text-[#690003] mb-4">Clear All Assignments?</h3>
        <p className="text-gray-600 mb-6">
          This will unassign all tasks from all employees. This action cannot be undone.
        </p>
        <div className="flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => setShowClearConfirm(false)}
            disabled={isClearing}
            className="border-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleClearAll}
            disabled={isClearing}
            className="bg-[#690003] hover:bg-[#8B0000] text-white"
          >
            {isClearing ? 'Clearing...' : 'Clear All'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ClearAllDialog;