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
      <DialogContent className="max-w-[90vw] sm:max-w-sm md:max-w-md lg:max-w-lg bg-white p-4 sm:p-5">
        <div className="space-y-3">
          <h3 className="text-base font-bold text-foreground">Clear All Tasks?</h3>
          <p className="text-gray-600 text-sm">
            Are you sure you want to unassign all tasks from {employee.name}? This action cannot be
            undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              onClick={handleClearAllTasks}
              disabled={clearAllEmployeeTasksMutation.isPending}
              className="bg-foreground hover:bg-red-600 text-white cursor-pointer transition-all duration-400 ease-in-out"
            >
              {clearAllEmployeeTasksMutation.isPending ? 'Clearing...' : 'Clear All'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowClearConfirm(null)}
              disabled={clearAllEmployeeTasksMutation.isPending}
              className="border-zinc-400 bg-white hover:bg-gray-300 cursor-pointer transition-all duration-400 ease-in-out"
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
