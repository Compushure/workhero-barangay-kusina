import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AssignedEmployee } from '@/types';
import { useClearUnstartedEmployeeTasksMutation } from '@/hooks/tanstack/mutations/managerAssignmentMutations';

interface ClearAllTasksDialogProps {
  showClearConfirm: string | null;
  setShowClearConfirm: (show: string | null) => void;
  employee: AssignedEmployee;
}

function ClearAllTasksDialog({
  showClearConfirm,
  setShowClearConfirm,
  employee,
}: ClearAllTasksDialogProps) {
  const clearUnstartedEmployeeTasksMutation = useClearUnstartedEmployeeTasksMutation();

  const handleClearAllTasks = async () => {
    if (!showClearConfirm) return;

    clearUnstartedEmployeeTasksMutation.mutate(
      { employeeId: showClearConfirm },
      {
        onSuccess: () => {
          setShowClearConfirm(null);
        },
      }
    );
  };

  return (
    <Dialog
      open={showClearConfirm === employee.id}
      onOpenChange={(open) => !open && setShowClearConfirm(null)}
    >
      <DialogContent className="max-w-[90vw] sm:max-w-sm md:max-w-md lg:max-w-lg bg-card p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base">
            Clear Unstarted Tasks For {employee.name}?
          </DialogTitle>
          <DialogDescription className="text-sm">
            This only clears tasks with no progress yet. Tasks with completed orders, or tasks that are in review, approved, or rejected status will stay untouched.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3 justify-end">
          <Button
            onClick={handleClearAllTasks}
            disabled={clearUnstartedEmployeeTasksMutation.isPending}
            className="bg-red-700 hover:bg-red-500 text-white cursor-pointer transition-all duration-400 ease-in-out"
          >
            {clearUnstartedEmployeeTasksMutation.isPending ? 'Clearing...' : 'Confirm'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowClearConfirm(null)}
            disabled={clearUnstartedEmployeeTasksMutation.isPending}
            className="border-zinc-400 bg-card text-foreground hover:bg-[#fafafa] hover:brightness-90 hover:text-foreground cursor-pointer transition-all duration-400 ease-in-out"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ClearAllTasksDialog;
