import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useClearUnstartedTaskAssignmentsMutation } from '@/hooks/tanstack/mutations/managerAssignmentMutations';
import { OctagonAlert } from 'lucide-react';

interface ClearUnstartedDialogProps {
  setShowClearConfirm: (show: boolean) => void;
}

function ClearUnstartedAssignedDialog({ setShowClearConfirm }: ClearUnstartedDialogProps) {
  const clearUnstartedMutation = useClearUnstartedTaskAssignmentsMutation();

  const handleClearUnstartedAssigned = async () => {
    clearUnstartedMutation.mutate(undefined, {
      onSuccess: () => {
        setShowClearConfirm(false);
      },
    });
  };

  return (
    <Dialog open={true} onOpenChange={setShowClearConfirm}>
      <DialogContent className="max-w-[90vw] sm:max-w-sm md:max-w-md lg:max-w-lg bg-card rounded-lg p-4 sm:p-5 shadow-lg transition-all duration-300 ease-in-out shadow-sm/50">
        <DialogHeader>
          <DialogTitle className="flex flex-col text-base font-bold text-foreground">
            <span className="flex text-red-700 text-sm leading-none items-center gap-1.5 mb-1.5">
              <OctagonAlert strokeWidth={2.5} size={16} />
              Danger Zone
            </span>
            <span>Clear Unstarted Assignments?</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm">
            This will unassign all tasks that have not been started at all by employees. This action
            cannot be undone. Proceed with caution
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3 justify-end">
          <Button
            onClick={handleClearUnstartedAssigned}
            disabled={clearUnstartedMutation.isPending}
            className="bg-red-700 hover:bg-red-500 text-white cursor-pointer transition-all duration-400 ease-in-out"
          >
            {clearUnstartedMutation.isPending ? 'Clearing...' : 'Clear Unstarted'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowClearConfirm(false)}
            disabled={clearUnstartedMutation.isPending}
            className="border-zinc-400 bg-white hover:bg-gray-300 cursor-pointer transition-all duration-400 ease-in-out"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ClearUnstartedAssignedDialog;
