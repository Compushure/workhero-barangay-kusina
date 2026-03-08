import { AssignedEmployee, AssignedTask } from '@/types';
import {
  ChevronDown,
  CircleCheck,
  CircleDashed,
  CircleX,
  Coins,
  HandCoins,
  Soup,
  Target,
  X,
} from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import { isTaskOverdue } from '@/utils/date-utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface EmployeeViewTaskBadgesProps {
  employee: AssignedEmployee;
  hiddenCount: number;
  isExpanded: boolean;
  toggleEmployeeExpand: (empId: string) => void;
  displayedTasks: AssignedTask[];
  formatDate: (dateString: string | null) => string;
  setShowRemoveConfirm: Dispatch<
    SetStateAction<{
      taskId?: string;
      assignmentId?: string;
      empId: string;
    } | null>
  >;
}

export default function EmployeeViewTaskBadges({
  employee,
  hiddenCount,
  isExpanded,
  toggleEmployeeExpand,
  displayedTasks,
  formatDate,
  setShowRemoveConfirm,
}: EmployeeViewTaskBadgesProps) {
  return (
    <div className="flex flex-col flex-1 min-w-0 pl-0 lg:pl-4 pr-0 lg:pr-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-l-0 lg:border-l-2 border-accent/20">
      <div className="flex items-start sm:items-center justify-between gap-2 mb-3 sm:mb-4 lg:pr-12">
        <h4 className="text-base sm:text-lg font-bold text-foreground">
          Current Tasks{' '}
          <span className="bg-accent/65 text-primary-foreground shadow-sm px-2 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm ml-2">
            {employee.assignedTasks.length}
          </span>
        </h4>
        {hiddenCount > 0 && (
          <button
            onClick={() => toggleEmployeeExpand(employee.id)}
            className="text-foreground text-sm sm:text-base font-medium flex items-center gap-1 hover:underline"
          >
            {isExpanded ? 'Show Less' : 'See All'}{' '}
            <ChevronDown className={`w-4 h-4 transition ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-2 sm:gap-3 max-h-100 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgb(203_213_225)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
        {displayedTasks.map((task: AssignedTask) => {
          const taskEmployee = task.assignedEmployees?.find((emp) => emp.id === employee.id);
          const completedOrders = taskEmployee?.completedOrders || 0;

          const StatusIcon = ({ icon: Icon, className = '' }: { icon: any; className?: string }) => (
            <p className={`flex gap-1 ${className} px-2 py-1 rounded-full items-center`}>
              <Icon strokeWidth={2.5} className="size-4" />
              <span className="hidden sm:inline text-xs">
                {task.status
                  ? task.status.charAt(0).toUpperCase() + task.status.slice(1)
                  : 'Unknown'}
              </span>
              {task.status === 'in review' && (
                <span className="text-xs sm:text-sm font-semibold leading-none">
                  {taskEmployee?.pendingOrders || 0}
                </span>
              )}
            </p>
          );

          return (
            <div
              key={task.id}
              className="flex flex-col lg:flex-row lg:items-start gap-2 lg:gap-3 bg-white px-3 py-3 rounded-2xl border-2 border-accent/25 h-full"
            >
              <div className="flex flex-col min-w-0 flex-1 gap-1">
                <span className="truncate text-zinc-700 text-sm sm:text-base font-semibold">
                  {task.taskName}
                </span>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                  <p
                    className={`block w-fit text-xs text-gray-500 ${isTaskOverdue(task.dateRange.end) ? 'text-red-700 font-semibold' : ''}`}
                  >
                    {formatDate(task.dateRange.end)}
                  </p>

                  {task.status === 'assigned' ? (
                    <StatusIcon icon={CircleDashed} className="bg-zinc-200 text-zinc-500" />
                  ) : task.status === 'in review' ? (
                    <StatusIcon icon={Target} className="bg-yellow-100 text-amber-400" />
                  ) : task.status === 'approved' ? (
                    <StatusIcon icon={CircleCheck} className="bg-green-100 text-green-600" />
                  ) : (
                    <StatusIcon icon={CircleX} className="bg-red-100 text-red-600" />
                  )}
                </div>
              </div>

              <div className="flex w-full lg:w-auto items-start lg:items-end justify-between lg:justify-start gap-2 lg:gap-3 shrink-0">
                <div className="flex gap-1 flex-nowrap items-center">
                  {taskEmployee?.pendingOrders === 0 && task.status === 'approved' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex px-1.5 py-1 rounded-full items-center bg-green-100 text-green-600">
                          <HandCoins strokeWidth={2.5} className="size-4" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        align="center"
                        className="bg-green-100 text-green-600 border-green-200"
                      >
                        Points claimed
                      </TooltipContent>
                    </Tooltip>
                  )}

                  <span
                    className={`flex text-xs sm:text-sm leading-none items-end px-2 pt-0.5 pb-1 rounded-full ${completedOrders === task.maxOrders ? 'bg-green-100 text-green-600 font-bold' : 'text-zinc-500'}`}
                  >
                    <Soup strokeWidth={1.75} className="size-4 sm:size-5 mr-1" />
                    {completedOrders} / {task.maxOrders}
                  </span>
                </div>

                <div className="flex items-end gap-2 text-zinc-500 pr-0 sm:pr-1">
                  <p className="flex gap-1 items-end font-semibold text-xs sm:text-sm leading-none">
                    <Coins strokeWidth={2.5} className="size-3.5 sm:size-4" />
                    <span className="inline-block">{task.points}</span>
                  </p>

                  <p className="flex gap-1.5 items-end">
                    <span className="inline-block italic font-normal text-xs sm:text-sm leading-none">XP</span>
                    <span className="inline-block font-semibold text-xs sm:text-sm leading-none">
                      {task.xp}
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (!taskEmployee?.assignmentId) return;
                    setShowRemoveConfirm({
                      assignmentId: taskEmployee.assignmentId,
                      empId: employee.id,
                    });
                  }}
                  className="self-end sm:self-auto hover:scale-130 transition-all duration-500 ease-in-out cursor-pointer"
                >
                  <X className="size-4 text-foreground hover:text-red-500" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
