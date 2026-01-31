import { AssignedEmployee, AssignedTask } from "@/types";
import { ChevronDown, CircleCheck, CircleDashed, CircleX, Target, X } from "lucide-react";
import { RefObject, SetStateAction } from "react";

interface TaskViewEmployeeBadgesProps {
  task: AssignedTask;
  hasOverflow: boolean;
  expanded: boolean;
  setExpanded: (value: SetStateAction<boolean>) => void;
  badgesContainerRef: RefObject<HTMLDivElement | null>;
  displayedEmployees: AssignedEmployee[];
  setShowRemoveConfirm: (value: SetStateAction<string | null>) => void;
}

export default function TaskViewEmployeeBadges({
  task,
  hasOverflow,
  expanded,
  setExpanded,
  badgesContainerRef,
  displayedEmployees,
  setShowRemoveConfirm
} : TaskViewEmployeeBadgesProps) {
  return (     
    <section className="">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-base font-semibold text-[#690003]">
          Assigned to{' '}
          <span className="bg-zinc-200 text-gray-700 shadow w-7 h-6 px-1 rounded-full text-sm ml-1.5 inline-flex items-center justify-center">
            {(task.assignedEmployees ?? []).length}
          </span>
        </h4>
        {(hasOverflow || expanded) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[#690003] font-medium flex items-center gap-1 hover:underline"
          >
            {expanded ? 'Show Less' : 'See All'}{' '}
            <ChevronDown className={`w-4 h-4 transition ${expanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Employee Assigned Badges */}
      <div
        ref={badgesContainerRef}
        className={`flex flex-wrap gap-3 transition-all duration-300 ${!expanded ? 'max-h-10 overflow-hidden' : ''}`}
      >
        {(displayedEmployees ?? []).map((emp) => (
          <div
            key={emp.id}
            className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border-2 border-gray-300"
          >
            {emp.status === "assigned" ? 
              <CircleDashed strokeWidth={2.5} className="size-5 p-0.5 text-zinc-500" /> :
            emp.status === "in review" ?
              <Target strokeWidth={2.5} className="size-5 p-0.5 text-yellow-500" /> :
            emp.status === "approved" ?
              <CircleCheck strokeWidth={2.5} className="size-5 p-0.5 text-green-600" /> :
              <CircleX strokeWidth={2.5} className="size-5 p-0.5 text-red-600" />
            }
            <span className="font-medium text-sm text-zinc-700">{emp.name}</span>
            <span className="text-gray-500 font-normal text-xs">{emp.empId}</span>
            <button
              onClick={() => setShowRemoveConfirm(emp.id)}
              className="ml-2 transition-all duration-500 ease-in-out cursor-pointer hover:scale-130"
            >
              <X className="size-3.5 text-[#690003] hover:text-red-500" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}