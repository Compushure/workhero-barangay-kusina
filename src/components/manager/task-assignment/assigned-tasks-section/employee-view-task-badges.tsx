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
  Utensils,
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
    <div className="flex flex-col flex-1 min-w-0 w-full pl-0 lg:pl-3 pr-0 lg:pr-1.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-l-0 lg:border-l-2 border-accent/20">
      <div className="flex items-start sm:items-center justify-between gap-1.5 mb-2 sm:mb-3 lg:pr-10">
        <h4 className="text-sm font-bold text-foreground">
          Current Tasks{' '}
          <span className="bg-accent/65 text-primary-foreground shadow-sm px-1.5 py-0.5 sm:py-0.5 rounded-full text-xs ml-1.5">
            {employee.assignedTasks.length}
          </span>
        </h4>
        {hiddenCount > 0 && (
          <button
            onClick={() => toggleEmployeeExpand(employee.id)}
            className="text-foreground text-xs sm:text-sm font-medium flex items-center gap-0.5 hover:underline"
          >
            {isExpanded ? 'Show Less' : 'See All'}{' '}
            <ChevronDown className={`w-3.5 h-3.5 transition ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-1.5 sm:gap-2 max-h-100 overflow-y-auto pr-0.5 [scrollbar-width:thin] [scrollbar-color:rgb(203_213_225)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
        {displayedTasks.map((task: AssignedTask) => {
          const taskEmployee = task.assignedEmployees?.find((emp) => emp.id === employee.id);
          const completedOrders = taskEmployee?.completedOrders || 0;
          const isServed = completedOrders >= task.maxOrders && Boolean(taskEmployee?.completedAt);
          const hasClaimedPoints = taskEmployee?.pendingOrders === 0 && task.status === 'approved';

          const StatusIcon = ({
            icon: Icon,
            className = '',
          }: {
            icon: any;
            className?: string;
          }) => (
            <p className={`flex gap-1 ${className} px-1.5 py-0.5 rounded-full items-center`}>
              <Icon strokeWidth={2.5} className="size-3.5" />
              <span className="hidden sm:inline text-xs">
                {task.status
                  ? task.status.charAt(0).toUpperCase() + task.status.slice(1)
                  : 'Unknown'}
              </span>
              {task.status === 'in review' && (
                <span className="text-xs font-semibold leading-none">
                  {taskEmployee?.pendingOrders || 0}
                </span>
              )}
            </p>
          );

          return (
            <div
              key={task.id}
              className="relative flex flex-col md:flex-row md:items-start gap-1.5 md:gap-2 bg-white pl-3 pr-6 py-3 rounded-2xl border-2 border-accent/25 h-full"
            >
              <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                <span className="truncate text-zinc-700 text-xs sm:text-sm font-semibold">
                  {task.taskName}
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  <p
                    className={`block w-fit text-[0.7rem] md:text-xs 2xl:text-[0.6rem] text-gray-500 ${isTaskOverdue(task.dateRange.end) ? 'text-red-700 font-semibold' : ''}`}
                  >
                    {formatDate(task.dateRange.start)} -{' '}
                    {formatDate(task.dateRange.end) || 'No deadline'}
                  </p>

                  {task.status === 'assigned' ? (
                    <StatusIcon icon={CircleDashed} className="bg-zinc-200 text-zinc-500" />
                  ) : task.status === 'in review' ? (
                    <StatusIcon icon={Target} className="bg-yellow-100 text-amber-600" />
                  ) : task.status === 'approved' ? (
                    <StatusIcon icon={CircleCheck} className="bg-green-100 text-green-600" />
                  ) : (
                    <StatusIcon icon={CircleX} className="bg-red-100 text-red-600" />
                  )}
                </div>
              </div>

              <div className="flex w-full md:w-auto items-start md:items-end justify-between md:justify-start gap-0 md:gap-0.5 shrink-0">
                <div className="flex md:flex-col items-center md:items-end gap-2 md:gap-1">
                  <div className="flex gap-0.5 flex-nowrap items-center">
                    {isServed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex px-1.5 py-0.5 rounded-full items-center bg-violet-200 text-violet-600">
                            <Utensils strokeWidth={2.5} className="size-3.5" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          align="center"
                          className="bg-violet-50 text-violet-700"
                        >
                          Dishes served
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      hasClaimedPoints && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex px-1 py-0.5 rounded-full items-center bg-green-100 text-green-600">
                              <HandCoins strokeWidth={2.5} className="size-3.5" />
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
                      )
                    )}

                    <span
                      className={`flex text-xs leading-none items-end px-1.5 pt-0.5 pb-0.5 rounded-full ${completedOrders === task.maxOrders ? 'bg-green-100 text-green-600 font-bold' : 'text-zinc-500'}`}
                    >
                      <Soup strokeWidth={1.75} className="size-3.5 sm:size-4 mr-0.5" />
                      {completedOrders} / {task.maxOrders}
                    </span>
                  </div>

                  <div className="flex items-end gap-1.5 text-zinc-500 pr-0 sm:pr-1.5">
                    <p className="flex gap-0.5 items-end font-semibold text-xs leading-none">
                      <Coins strokeWidth={2.5} className="size-3 sm:size-3.5" />
                      <span className="inline-block">{task.points}</span>
                    </p>

                    <p className="flex gap-1 items-end">
                      <span className="inline-block italic font-normal text-xs leading-none">
                        XP
                      </span>
                      <span className="inline-block font-semibold text-xs leading-none">
                        {task.xp}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!taskEmployee?.assignmentId) return;
                    setShowRemoveConfirm({
                      assignmentId: taskEmployee.assignmentId,
                      empId: employee.id,
                    });
                  }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 hover:scale-130 transition-all duration-500 ease-in-out cursor-pointer"
                >
                  <X className="size-3.5 text-foreground hover:text-red-500" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
