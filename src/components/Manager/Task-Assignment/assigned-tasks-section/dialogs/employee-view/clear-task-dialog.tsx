import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AssignedEmployee } from "@/types";
import { useTaskAssignment } from "../../../task-assignment-page-context";

interface ClearTaskDialogProps {
showRemoveConfirm: {
    taskId: string;
    empId: string;
  } | null, 
setShowRemoveConfirm: (show: {
    taskId: string;
    empId: string;
  } | null) => void, 
employee: AssignedEmployee
}

function ClearTaskDialog({showRemoveConfirm, setShowRemoveConfirm, employee} : ClearTaskDialogProps) {
  const { removeAssignment } = useTaskAssignment();

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
              variant="outline"
              onClick={() => setShowRemoveConfirm(null)}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (showRemoveConfirm) {
                  removeAssignment(showRemoveConfirm.taskId, showRemoveConfirm.empId);
                  setShowRemoveConfirm(null);
                }
              }}
              className="bg-[#690003] hover:bg-[#8B0000] text-white"
            >
              Unassign
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ClearTaskDialog;