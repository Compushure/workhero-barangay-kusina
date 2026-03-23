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
import { useClearAllEmployeeTasksMutation } from '@/hooks/tanstack/mutations/managerAssignmentMutations';

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
  const clearAllEmployeeTasksMutation = useClearAllEmployeeTasksMutation();

  const handleClearAllTasks = async () => {
    if (!showClearConfirm) return;

    clearAllEmployeeTasksMutation.mutate(
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
          <DialogTitle className="text-foreground text-base">Clear All Tasks?</DialogTitle>
          <DialogDescription className="text-sm">
            Are you sure you want to unassign all tasks from {employee.name}? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3 justify-end">
          <Button
            onClick={handleClearAllTasks}
            disabled={clearAllEmployeeTasksMutation.isPending}
            className="bg-red-700 hover:bg-red-500 text-white cursor-pointer transition-all duration-400 ease-in-out"
          >
            {clearAllEmployeeTasksMutation.isPending ? 'Clearing...' : 'Confirm'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowClearConfirm(null)}
            disabled={clearAllEmployeeTasksMutation.isPending}
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
