'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useGetEmployeeTasks } from '@/hooks/tanstack/queries/employeeTasksQueries';
import { useClaimTaskPointsandXP } from '@/hooks/tanstack/mutations/employeeTasksMutations';
import type { TaskStatusItem } from '@/components/employee/task-status/types';

type TasksTableProps = {
  /** Optional fallback data for testing; live data is fetched */
  tasks?: TaskStatusItem[];
};

const formatDate = (iso?: string | null) => {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function TasksTable({ tasks: fallbackTasks = [] }: TasksTableProps) {
  const { data, isLoading, isError } = useGetEmployeeTasks();
  const claimMutation = useClaimTaskPointsandXP();

  const approvedTasks = useMemo(() => {
    const source = data?.verifiedTasks ?? fallbackTasks;
    // Show approved tasks that still have pending instances to claim
    return (source || []).filter((task) => task.status === 'approved' && task.pendingOrders > 0);
  }, [data?.verifiedTasks, fallbackTasks]);

  const handleClaim = (task: TaskStatusItem) => {
    if (claimMutation.isPending) return;
    claimMutation.mutate({
      kpitaskId: task.id,
      taskName: task.name,
      pendingOrders: task.pendingOrders,
      completedOrders: task.completedOrders,
      maxOrders: task.maxOrders,
    });
  };

  return (
    <div className="flex flex-col max-h-[70vh] gap-4 font-pixel">
      {isLoading ? (
        <p className="text-sm text-center text-gray-600">Loading approved tasks…</p>
      ) : isError ? (
        <p className="text-sm text-center text-red-600">Failed to load approved tasks.</p>
      ) : approvedTasks.length === 0 ? (
        <p className="text-sm text-center text-gray-600">No approved tasks waiting to claim.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {approvedTasks.map((task) => {
            const totalPoints = task.points * task.pendingOrders;
            const totalXp = task.xp * task.pendingOrders;

            return (
              <div
                key={task.id}
                className="bg-[#6D4A2C] rounded-xl shadow-sm p-4 border-3 border-[#47331F] grid grid-cols-3 gap-10 items-center min-w-0"
              >
                {/* Column 1: Category name & description */}
                <div className="flex flex-col font-jersey min-w-0">
                  <p className="text-xl text-[#F5E8D6] uppercase tracking-wide truncate">
                    {task.name}
                  </p>
                  <p className="text-md text-[#948E85] truncate">{task.description}</p>
                </div>

                {/* Column 2: Instances and approval date */}
                <div className="flex flex-col font-jersey text-[#F5E8D6] min-w-0">
                  <span className="text-xl uppercase tracking-wide truncate">
                    Instances: {task.completedOrders} / {task.maxOrders}
                  </span>
                  <span className="text-[#948E85] text-md truncate">
                    Approved on {formatDate(task.approvedAt)}
                  </span>
                </div>

                {/* Column 3: Totals + Claim */}
                <div className="flex items-center justify-between min-w-0">
                  <div className="text-left font-jersey text-lg text-yellow-500 min-w-0">
                    <p className="truncate">
                      🪙 {totalPoints} <span className="ml-1 text-green-500">🟢 {totalXp}</span>
                    </p>
                  </div>
                  <Button
                    onClick={() => handleClaim(task)}
                    disabled={claimMutation.isPending}
                    title="Claim to cook dish"
                    className="bg-[#D08C23] border-3 text-xs font-pixel border-[#47331F] shadow-[4px_4px_0px_#000] shadow-[#543A23] text-[#211A12] hover:opacity-90 cursor-pointer hover:translate-y-1 hover:shadow-[2px_2px_0px_#000]
                     transition-all duration-150 hover:bg-[#D08C23]/50"
                  >
                    {claimMutation.isPending ? 'Claiming…' : 'Claim'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
