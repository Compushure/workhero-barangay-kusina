import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Employee } from "../../employee-view-card";

interface ClearAllTasksDialogProps {
  showClearConfirm: string | null, 
  setShowClearConfirm: (show: string | null) => void, 
  employee: Employee, 
  onClearAllEmployeeTasks?: (employeeId: string) => void;
}

function ClearAllTasksDialog({showClearConfirm, setShowClearConfirm, employee, onClearAllEmployeeTasks} : ClearAllTasksDialogProps) {
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
            Are you sure you want to unassign all tasks from {employee.name}? This action
            cannot be undone.
          </p>
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowClearConfirm(null)}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (showClearConfirm && onClearAllEmployeeTasks) {
                  onClearAllEmployeeTasks(showClearConfirm);
                }
                setShowClearConfirm(null);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Clear All
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ClearAllTasksDialog;