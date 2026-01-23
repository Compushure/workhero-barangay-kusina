import { Button } from '@/components/ui/button';
import { DialogFooter, DialogHeader, Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { AssignedTask } from '@/types';
import { useTaskAssignment } from '../../../task-assignment-page-context';

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
  const { deleteTask } = useTaskAssignment();
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
            className="border-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (deleteTask) {
                deleteTask(task.id);
              }
              setShowDeleteConfirm(false);
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteTaskDialog;
