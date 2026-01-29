import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { AssignedEmployee } from '@/types';
import { useClearAllEmployeeTasksMutation } from '@/hooks/tanstack/mutations/managerAssignmentMutations';

interface ClearAllTasksDialogProps {
  showClearConfirm: string | null;
  setShowClearConfirm: (show: string | null) => void;
  employee: AssignedEmployee;
}

function ClearAllTasksDialog({
  showClearConfirm,
  setShowClearConfirm,
  employee,
}: ClearAllTasksDialogProps) {
  const clearAllEmployeeTasksMutation = useClearAllEmployeeTasksMutation();

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
              disabled={clearAllEmployeeTasksMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer transition-all duration-500 ease-in-out"
            >
              {clearAllEmployeeTasksMutation.isPending ? 'Clearing...' : 'Clear All'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowClearConfirm(null)}
              disabled={clearAllEmployeeTasksMutation.isPending}
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

export default ClearAllTasksDialog;
