import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AssignedTask } from '@/types';
import { useState } from 'react';
import { useDeleteTaskMutation } from '@/hooks/tanstack/mutations/managerAssignmentMutations';

interface UnassignEmployeeDialogProps {
  showRemoveConfirm: string | null;
  setShowRemoveConfirm: (show: string | null) => void;
  task: AssignedTask;
}

function UnassignEmployeeDialog({
  showRemoveConfirm,
  setShowRemoveConfirm,
  task,
}: UnassignEmployeeDialogProps) {
  const deleteTaskMutation = useDeleteTaskMutation();

  const handleUnassign = async () => {
    if (!showRemoveConfirm) return;
    
    // Use the mutation which will handle cache invalidation
    deleteTaskMutation.mutate(
      { taskId: task.id },
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
          <DialogTitle className="text-[#690003]">Unassign Employee?</DialogTitle>
          <DialogDescription>
            Are you sure you want to unassign this employee from this task?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowRemoveConfirm(null)}
            disabled={deleteTaskMutation.isPending}
            className="border-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUnassign}
            disabled={deleteTaskMutation.isPending}
            className="bg-[#690003] hover:bg-[#8B0000] text-white"
          >
            {deleteTaskMutation.isPending ? 'Unassigning...' : 'Unassign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UnassignEmployeeDialog;
