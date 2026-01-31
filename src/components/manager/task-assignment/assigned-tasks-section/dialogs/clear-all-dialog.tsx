import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useClearAllTasksMutation } from '@/hooks/tanstack/mutations/managerAssignmentMutations';

interface ClearAllDialogProps {
  setShowClearConfirm: (show: boolean) => void;
}

function ClearAllDialog({ setShowClearConfirm }: ClearAllDialogProps) {
  const clearAllMutation = useClearAllTasksMutation();

  const handleClearAll = async () => {
    clearAllMutation.mutate(undefined, {
      onSuccess: () => {
        setShowClearConfirm(false);
      },
    });
  };

  return (
    <Dialog open={true} onOpenChange={setShowClearConfirm}>
      <DialogContent className="max-w-sm bg-white rounded-lg p-6 shadow-lg transition-all duration-300 ease-in-out shadow-sm/50">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#690003]">
            Clear All Assignments?
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            This will unassign all tasks from all employees. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-4 justify-end">
          <Button
            onClick={handleClearAll}
            disabled={clearAllMutation.isPending}
            className="bg-[#690003] hover:bg-[#af3b3f] text-white cursor-pointer transition-all duration-500 ease-in-out"
          >
            {clearAllMutation.isPending ? 'Clearing...' : 'Clear All'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowClearConfirm(false)}
            disabled={clearAllMutation.isPending}
            className="border-gray-300 hover:bg-gray-200 cursor-pointer transition-all duration-500 ease-in-out"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ClearAllDialog;
