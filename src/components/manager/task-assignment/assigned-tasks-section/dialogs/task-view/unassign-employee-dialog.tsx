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
import { useTaskAssignment } from '../../../task-assignment-page-context';

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
  const { removeAssignment } = useTaskAssignment();

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
            onClick={() => {
              if (showRemoveConfirm) {
                removeAssignment(task.id, showRemoveConfirm);
                setShowRemoveConfirm(null);
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white cursor-pointer transition-all duration-500 ease-in-out"
          >
            Unassign
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
