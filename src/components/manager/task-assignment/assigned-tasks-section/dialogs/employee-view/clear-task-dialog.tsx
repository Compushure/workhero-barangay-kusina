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
import { useDeleteTaskMutation } from '@/hooks/tanstack/mutations/managerAssignmentMutations';

interface ClearTaskDialogProps {
  showRemoveConfirm: {
    assignmentId?: string;
    empId: string;
  } | null;
  setShowRemoveConfirm: (
    show: {
      assignmentId?: string;
      empId: string;
    } | null
  ) => void;
  employee: AssignedEmployee;
}

function ClearTaskDialog({
  showRemoveConfirm,
  setShowRemoveConfirm,
  employee,
}: ClearTaskDialogProps) {
  const deleteTaskMutation = useDeleteTaskMutation();

  const handleRemoveAssignment = async () => {
    if (!showRemoveConfirm?.assignmentId) return;

    // Use the mutation which will handle cache invalidation
    deleteTaskMutation.mutate(
      { assignmentId: showRemoveConfirm.assignmentId },
      {
        onSuccess: () => {
          setShowRemoveConfirm(null);
        },
      }
    );
  };

  return (
    <Dialog
      open={showRemoveConfirm?.empId === employee.id}
      onOpenChange={(open) => !open && setShowRemoveConfirm(null)}
    >
      <DialogContent className="max-w-[90vw] sm:max-w-sm md:max-w-md lg:max-w-lg bg-card p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base">Unassign Task?</DialogTitle>
          <DialogDescription className="text-sm">
            Are you sure you want to unassign this task from this employee?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3 justify-end">
          <Button
            onClick={handleRemoveAssignment}
            disabled={deleteTaskMutation.isPending}
            className="bg-red-700 hover:bg-red-500 text-white cursor-pointer transition-all duration-400 ease-in-out"
          >
            {deleteTaskMutation.isPending ? 'Unassigning...' : 'Confirm'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowRemoveConfirm(null)}
            disabled={deleteTaskMutation.isPending}
            className="border-zinc-400 bg-card text-foreground hover:bg-[#fafafa] hover:brightness-90 hover:text-foreground cursor-pointer transition-all duration-400 ease-in-out"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ClearTaskDialog;
