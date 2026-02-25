import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useClearAssignedTasksMutation } from '@/hooks/tanstack/mutations/managerAssignmentMutations';
import { OctagonAlert } from 'lucide-react';

interface ClearAllDialogProps {
  setShowClearConfirm: (show: boolean) => void;
}

function ClearAllAssignedDialog({ setShowClearConfirm }: ClearAllDialogProps) {
  const clearAllMutation = useClearAssignedTasksMutation();

  const handleClearAllAssigned = async () => {
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
          <DialogTitle className="flex flex-col text-lg font-bold text-[#690003]">
            <span className='flex text-red-700 text-base leading-none items-center gap-2 mb-2'>
              <OctagonAlert strokeWidth={2.5}/>
              Danger Zone
            </span>
            <span>Clear All Assigned Assignments?</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            This will unassign all tasks with 'Assigned' status from all employees. This action cannot be undone. Proceed with caution
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-4 justify-end">
          <Button
            onClick={handleClearAllAssigned}
            disabled={clearAllMutation.isPending}
            className="bg-red-700 hover:bg-red-500 text-white cursor-pointer transition-all duration-500 ease-in-out"
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

export default ClearAllAssignedDialog;
