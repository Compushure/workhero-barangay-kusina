import { Button } from '@/components/ui/button';
import { DialogFooter, DialogHeader, Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { AssignedTask } from '@/types';
import { useTaskAssignment } from '../../../task-assignment-page-context';
import { useState } from 'react';

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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteTask = async () => {
    if (isDeleting || !deleteTask) return;
    setIsDeleting(true);
    try {
      deleteTask(task.id);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
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
            disabled={isDeleting}
            className="border-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteTask}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteTaskDialog;
