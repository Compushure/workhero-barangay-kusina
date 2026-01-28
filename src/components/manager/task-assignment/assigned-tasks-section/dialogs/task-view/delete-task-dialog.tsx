import { Button } from '@/components/ui/button';
import { DialogFooter, DialogHeader, Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { AssignedTask } from '@/types';
import { useDeleteTaskMutation } from '@/hooks/tanstack/mutations/managerAssignmentMutations';

interface DeleteTaskDialogProps {
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  task: AssignedTask;
}
function DeleteTaskDialog({
  showDeleteConfirm,
  setShowDeleteConfirm,
  task,
}: DeleteTaskDialogProps) {
  const deleteTaskMutation = useDeleteTaskMutation();

  const handleDeleteTask = async () => {
    deleteTaskMutation.mutate(
      { taskId: task.id },
      {
        onSuccess: () => {
          setShowDeleteConfirm(false);
        },
      }
    );
  };
  return (
    <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#690003]">Delete Task?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this task and unassign all employees? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={deleteTaskMutation.isPending}
            className="border-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteTask}
            disabled={deleteTaskMutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {deleteTaskMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteTaskDialog;
