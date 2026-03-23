import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AssignedTask } from '@/types';
import { useState } from 'react';
import { useDeleteTaskMutation } from '@/hooks/tanstack/mutations/managerAssignmentMutations';

interface UnassignEmployeeDialogProps {
  showRemoveConfirm: { assignmentId?: string; employeeId: string } | null;
  setShowRemoveConfirm: (show: { assignmentId?: string; employeeId: string } | null) => void;
  task: AssignedTask;
}

function UnassignEmployeeDialog({
  showRemoveConfirm,
  setShowRemoveConfirm,
  task,
}: UnassignEmployeeDialogProps) {
  const deleteTaskMutation = useDeleteTaskMutation();

  const handleUnassign = async () => {
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
    <Dialog open={!!showRemoveConfirm} onOpenChange={(open) => !open && setShowRemoveConfirm(null)}>
      <DialogContent className="max-w-[90vw] sm:max-w-sm md:max-w-md lg:max-w-lg bg-card p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base">Unassign Employee?</DialogTitle>
          <DialogDescription className="text-sm">
            Are you sure you want to unassign this employee from this task?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={handleUnassign}
            disabled={deleteTaskMutation.isPending}
            className="bg-red-700 hover:bg-red-500 text-white cursor-pointer transition-all duration-400 ease-in-out"
          >
            {deleteTaskMutation.isPending ? 'Unassigning...' : 'Confirm'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowRemoveConfirm(null)}
            className="border-zinc-400 bg-card text-foreground hover:bg-[#fafafa] hover:brightness-90 hover:text-foreground cursor-pointer transition-all duration-400 ease-in-out"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UnassignEmployeeDialog;
