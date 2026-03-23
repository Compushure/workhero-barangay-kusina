import { Button } from '@/components/ui/button';
import {
  DialogFooter,
  DialogHeader,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { AssignedTask } from '@/types';
import { useDeleteTaskGroupMutation } from '@/hooks/tanstack/mutations/managerAssignmentMutations';

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
  const deleteTaskMutation = useDeleteTaskGroupMutation();

  const handleDeleteTask = async () => {
    deleteTaskMutation.mutate(
      {
        categoryId: task.taskId,
        deadlineDate: task.dateRange.end ?? '',
        maxOrders: task.maxOrders,
        createdAt: task.dateRange.start,
      },
      {
        onSuccess: () => {
          setShowDeleteConfirm(false);
        },
      }
    );
  };
  return (
    <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <DialogContent className="max-w-[90vw] sm:max-w-sm md:max-w-md lg:max-w-lg bg-card p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base">Delete Task?</DialogTitle>
          <DialogDescription className="text-sm">
            Are you sure you want to delete this task and unassign all employees? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={handleDeleteTask}
            disabled={deleteTaskMutation.isPending}
            className="bg-red-700 hover:bg-red-500 text-white cursor-pointer transition-all duration-400 ease-in-out"
          >
            {deleteTaskMutation.isPending ? 'Deleting...' : 'Confirm'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(false)}
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

export default DeleteTaskDialog;
