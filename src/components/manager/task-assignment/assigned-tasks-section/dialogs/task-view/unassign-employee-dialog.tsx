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
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle className="text-foreground">Unassign Employee?</DialogTitle>
          <DialogDescription>
            Are you sure you want to unassign this employee from this task?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={handleUnassign}
            disabled={deleteTaskMutation.isPending}
            className="bg-foreground hover:bg-[#af3b3f] text-white cursor-pointer transition-all duration-500 ease-in-out"
          >
            {deleteTaskMutation.isPending ? 'Unassigning...' : 'Unassign'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowRemoveConfirm(null)}
            className="border-gray-300 hover:bg-gray-200 cursor-pointer transition-all duration-500 ease-in-out"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UnassignEmployeeDialog;
