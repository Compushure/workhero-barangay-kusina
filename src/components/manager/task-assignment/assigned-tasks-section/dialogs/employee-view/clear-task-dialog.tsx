import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { AssignedEmployee } from '@/types';
import { useTaskAssignment } from '../../../task-assignment-page-context';
import { useState } from 'react';

interface ClearTaskDialogProps {
  showRemoveConfirm: {
    taskId: string;
    empId: string;
  } | null;
  setShowRemoveConfirm: (
    show: {
      taskId: string;
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
  const { removeAssignment } = useTaskAssignment();
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveAssignment = async () => {
    if (isRemoving || !showRemoveConfirm) return;
    setIsRemoving(true);
    try {
      removeAssignment(showRemoveConfirm.taskId, showRemoveConfirm.empId);
    } finally {
      setIsRemoving(false);
      setShowRemoveConfirm(null);
    }
  };

  return (
    <Dialog
      open={showRemoveConfirm?.empId === employee.id}
      onOpenChange={(open) => !open && setShowRemoveConfirm(null)}
    >
      <DialogTitle className="hidden">Unassign Task to Employee</DialogTitle>
      <DialogContent className="bg-white">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[#690003]">Unassign Task?</h3>
          <p className="text-gray-600">
            Are you sure you want to unassign this task from this employee?
          </p>
          <div className="flex gap-4 justify-end">
            <Button
              onClick={handleRemoveAssignment}
              disabled={isRemoving}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer transition-all duration-500 ease-in-out"
            >
              {isRemoving ? 'Unassigning...' : 'Unassign'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRemoveConfirm(null)}
              disabled={isRemoving}
              className="border-gray-300 hover:bg-gray-200 cursor-pointer transition-all duration-500 ease-in-out"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ClearTaskDialog;
