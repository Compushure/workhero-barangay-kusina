import { AssignedEmployee, AssignedTask } from "@/types";
import { ChevronDown, CircleCheck, CircleDashed, CircleX, Coins, HandCoins, Soup, Target, X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { isTaskOverdue } from "@/utils/date-utils";

interface EmployeeViewTaskBadgesProps {
  employee: AssignedEmployee;
  hiddenCount: number;
  isExpanded: boolean;
  toggleEmployeeExpand: (empId: string) => void;
  displayedTasks: AssignedTask[];
  formatDate: (dateString: string | null) => string;
  setShowRemoveConfirm: Dispatch<SetStateAction<{
      taskId: string;
      empId: string;
  } | null>>
}

export default function EmployeeViewTaskBadges({ 
  employee,
  hiddenCount, 
  isExpanded, 
  toggleEmployeeExpand, 
  displayedTasks, 
  formatDate, 
  setShowRemoveConfirm 
} : EmployeeViewTaskBadgesProps) {
  return (
    <div className="flex flex-col pl-4 pr-2 w-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-foreground">
          Current Tasks{' '}
          <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded-full text-sm ml-2">
            {employee.assignedTasks.length}
          </span>
        </h4>
        {hiddenCount > 0 && (
          <button
            onClick={() => toggleEmployeeExpand(employee.id)}
            className="text-foreground font-medium flex items-center gap-1 hover:underline"
          >
            {isExpanded ? 'Show Less' : 'See All'}{' '}
            <ChevronDown
              className={`w-4 h-4 transition ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>

      {/* Task Badges */}
      <div className="grid grid-cols-2 gap-3">
        {displayedTasks.map((task: AssignedTask) => {
          const taskEmployee = task.assignedEmployees?.find(
            (emp) => emp.id === employee.id
          );
          const completedOrders = taskEmployee?.completedOrders || 0;
          // Reusable StatusIcon component
          const StatusIcon = ({ icon: Icon, className = "",  }: { icon: any; className?: string;}) => (
            <p className={`flex gap-1 ${className} px-2 py-1 rounded-full`}>
              <Icon strokeWidth={2.5} className={`size-4`} />
              <span className={`text-xs`}>
                {task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1) : 'Unknown'}
              </span>
            </p>
          );

          return (
            <div
              key={task.id}
              className="flex items-center justify-between bg-white px-3 py-3 rounded-2xl border-2 border-accent/25 h-full"
            >
              <div className="flex flex-col w-[65%] gap-1">
                  <span className='truncate text-zinc-700 text-sm font-semibold'>
                    {task.taskName}
                  </span>
                  <div className='flex items-center gap-2'>
                    <p className={`text-xs text-gray-500 ${isTaskOverdue(task.dateRange.end) ? 'text-red-700 font-semibold' : ''}`}>
                      {formatDate(task.dateRange.end)}
                    </p>

                    {task.status === "assigned" ? 
                      <StatusIcon icon={CircleDashed} className="bg-zinc-200 text-zinc-500"/> :
                    task.status === "in review" ?
                      <StatusIcon icon={Target} className="bg-yellow-100 text-amber-400"/> : 
                    task.status === "approved" ?
                      <StatusIcon icon={CircleCheck} className="bg-green-100 text-green-600"/> :
                      <StatusIcon icon={CircleX} className="bg-red-100 text-red-600"/>
                    }

                    {taskEmployee?.pendingOrders === 0 && task.status === "approved" &&
                      <p className={`flex gap-1 px-2 py-1 rounded-full items-center bg-violet-200 text-violet-600`}>
                        <HandCoins strokeWidth={2.5} className={`size-4 `}/>
                        <span className={`text-xs sr-only xl:not-sr-only`}>
                          Claimed
                        </span>
                      </p>
                    }
                  </div>
              </div>

              <div className='flex flex-col w-[30%] items-end pr-3 gap-2'>
                <span className='flex text-zinc-500 text-sm leading-none items-end'>
                  <Soup strokeWidth={1.75} className="size-5 mr-1" />
                  {completedOrders} / {task.maxOrders}
                </span>

                <div className="flex items-end gap-1 text-zinc-500">
                  <p className="flex gap-1 items-end font-semibold text-sm leading-none">
                    <Coins strokeWidth={2.5} className="size-4" />
                    <span className="inline-block">{task.points}</span>
                  </p>

                  <p className="flex gap-1.5 items-end">
                    <span className="inline-block italic font-normal text-sm leading-none">XP</span>
                    <span className="inline-block font-semibold text-sm leading-none">{task.xp}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setShowRemoveConfirm({ taskId: task.id, empId: employee.id })
                }
                className="hover:scale-130 transition-all duration-500 ease-in-out cursor-pointer"
              >
                <X className="size-4 text-foreground hover:text-red-500" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}