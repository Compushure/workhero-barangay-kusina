import { AssignedEmployee, AssignedTask } from '@/types';
import { ChevronDown, CircleCheck, CircleDashed, CircleX, Target, X } from 'lucide-react';
import { RefObject, SetStateAction } from 'react';
import { useMemo } from 'react';

interface TaskViewEmployeeBadgesProps {
  task: AssignedTask;
  hasOverflow: boolean;
  expanded: boolean;
  setExpanded: (value: SetStateAction<boolean>) => void;
  badgesContainerRef: RefObject<HTMLDivElement | null>;
  displayedEmployees: AssignedEmployee[];
  setShowRemoveConfirm: (
    value: SetStateAction<{ assignmentId?: string; employeeId: string } | null>
  ) => void;
}

export default function TaskViewEmployeeBadges({
  task,
  hasOverflow,
  expanded,
  setExpanded,
  badgesContainerRef,
  displayedEmployees,
  setShowRemoveConfirm,
}: TaskViewEmployeeBadgesProps) {
  const uniqueDisplayedEmployees = useMemo(() => {
    const employeeMap = new Map<string, AssignedEmployee>();

    for (const employee of displayedEmployees ?? []) {
      if (!employeeMap.has(employee.id)) {
        employeeMap.set(employee.id, employee);
      }
    }

    return Array.from(employeeMap.values());
  }, [displayedEmployees]);

  // Reusable StatusIcon component
  const StatusIcon = ({ icon: Icon, className = '' }: { icon: any; className?: string }) => (
    <p>
      <Icon strokeWidth={2.5} className={`size-4 p-0.5 rounded-full ${className}`} />
    </p>
  );

  return (
    <section className="">
      <div className="flex items-center justify-start gap-4 mb-2">
        <h4 className="text-sm font-semibold text-foreground">
          Assigned to{' '}
          <span className="bg-accent/65 text-primary-foreground shadow-sm w-6 h-5 px-0.5 rounded-full text-xs ml-1 inline-flex items-center justify-center">
            {(task.assignedEmployees ?? []).length}
          </span>
        </h4>
        {(hasOverflow || expanded) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-foreground text-xs font-medium flex items-center gap-0.5 hover:underline hover:text-accent duration-400 ease-in-out transition-all"
          >
            {expanded ? 'Show Less' : 'See All'}{' '}
            <ChevronDown className={`size-3.5 transition ${expanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Employee Assigned Badges */}
      <div
        ref={badgesContainerRef}
        className={`flex flex-wrap gap-2 transition-all duration-300 ${!expanded ? 'max-h-8 overflow-hidden' : ''}`}
      >
        {uniqueDisplayedEmployees.map((emp) => (
          <div
            key={emp.id}
            className="flex items-center gap-1 bg-card px-1.5 py-1 rounded-full border-2 border-accent/25 min-w-0 w-full sm:w-auto max-w-full sm:max-w-72 lg:max-w-80 2xl:max-w-96"
          >
            {emp.status === 'in review' ? (
              <StatusIcon icon={Target} className="bg-yellow-100 text-amber-400" />
            ) : emp.status === 'approved' ? (
              <StatusIcon icon={CircleCheck} className="bg-green-100 text-green-600" />
            ) : emp.status === 'rejected' ? (
              <StatusIcon icon={CircleX} className="bg-red-100 text-red-600" />
            ) : (
              <StatusIcon icon={CircleDashed} className="bg-zinc-200 text-zinc-500" />
            )}

            <span className="text-xs bg-background text-amber-700 px-1 py-2 leading-0 rounded-full">
              {emp.completedOrders}
            </span>

            <span className="font-medium text-xs text-zinc-700 truncate min-w-0 flex-1 sm:flex-initial sm:max-w-28 lg:max-w-36 2xl:max-w-44">
              {emp.name}
            </span>
            <span className="text-gray-500 font-normal text-xs truncate pl-1 min-w-0 max-w-18 sm:max-w-24 lg:max-w-30 2xl:max-w-36">
              {emp.empId}
            </span>
            <button
              onClick={() => {
                if (!emp.assignmentId) return;
                setShowRemoveConfirm({ assignmentId: emp.assignmentId, employeeId: emp.id });
              }}
              className="ml-1.5 transition-all duration-500 ease-in-out cursor-pointer hover:scale-130 shrink-0"
              title="Unassign Employee"
            >
              <X className="size-3 text-foreground hover:text-red-500" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
