<<<<<<< HEAD
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { AssignedEmployee } from '@/types';
import { useTaskAssignment } from '../../../task-assignment-page-context';
import { useState } from 'react';
=======
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AssignedEmployee } from "@/types";
import { useClearAllEmployeeTasksMutation } from '@/hooks/tanstack/mutations/managerAssignmentMutations';
>>>>>>> 21dc20f395a5946a2c04b9694f30d2c2b5b53422

interface ClearAllTasksDialogProps {
  showClearConfirm: string | null;
  setShowClearConfirm: (show: string | null) => void;
  employee: AssignedEmployee;
}

<<<<<<< HEAD
function ClearAllTasksDialog({
  showClearConfirm,
  setShowClearConfirm,
  employee,
}: ClearAllTasksDialogProps) {
  const { clearAllEmployeeTasks } = useTaskAssignment();
  const [isClearing, setIsClearing] = useState(false);
=======
function ClearAllTasksDialog({showClearConfirm, setShowClearConfirm, employee } : ClearAllTasksDialogProps) {
  const clearAllEmployeeTasksMutation = useClearAllEmployeeTasksMutation();
>>>>>>> 21dc20f395a5946a2c04b9694f30d2c2b5b53422

  const handleClearAllTasks = async () => {
    if (!showClearConfirm) return;
    
    clearAllEmployeeTasksMutation.mutate(
      { employeeId: showClearConfirm },
      {
        onSuccess: () => {
          setShowClearConfirm(null);
        },
      }
    );
  };

  return (
    <Dialog
      open={showClearConfirm === employee.id}
      onOpenChange={(open) => !open && setShowClearConfirm(null)}
    >
      <DialogTitle></DialogTitle>
      <DialogContent className="bg-white">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[#690003]">Clear All Tasks?</h3>
          <p className="text-gray-600">
            Are you sure you want to unassign all tasks from {employee.name}? This action cannot be
            undone.
          </p>
          <div className="flex gap-4 justify-end">
            <Button
              onClick={handleClearAllTasks}
              disabled={isClearing}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer transition-all duration-500 ease-in-out"
            >
              {isClearing ? 'Clearing...' : 'Clear All'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowClearConfirm(null)}
<<<<<<< HEAD
              disabled={isClearing}
              className="border-gray-300 hover:bg-gray-200 cursor-pointer transition-all duration-500 ease-in-out"
            >
              Cancel
            </Button>
=======
              disabled={clearAllEmployeeTasksMutation.isPending}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleClearAllTasks}
              disabled={clearAllEmployeeTasksMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {clearAllEmployeeTasksMutation.isPending ? 'Clearing...' : 'Clear All'}
            </Button>
>>>>>>> 21dc20f395a5946a2c04b9694f30d2c2b5b53422
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ClearAllTasksDialog;
