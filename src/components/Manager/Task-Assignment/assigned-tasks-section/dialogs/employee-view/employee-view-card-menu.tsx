import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MoreVertical } from "lucide-react";
import { AssignedEmployee } from "@/types";

interface EmployeeViewCardMenuProps {
  openPopoverId: string | null, 
  setOpenPopoverId: (open: string | null) => void, 
  employee: AssignedEmployee,
  setShowClearConfirm: (open: string | null) => void
}

function EmployeeViewCardMenu({openPopoverId, setOpenPopoverId, employee, setShowClearConfirm} : EmployeeViewCardMenuProps) {
  return (
    <Popover
      open={openPopoverId === employee.id}
      onOpenChange={(open) => setOpenPopoverId(open ? employee.id : null)}
    >
      <div className="flex w-fit">
        <PopoverTrigger asChild>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical className="size-6" />
          </button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-40 p-2" align="end">
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => {
              setShowClearConfirm(employee.id);
              setOpenPopoverId(null);
            }}
            variant="ghost"
            className="justify-start text-red-600 hover:bg-red-50"
          >
            Clear All Tasks
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default EmployeeViewCardMenu;