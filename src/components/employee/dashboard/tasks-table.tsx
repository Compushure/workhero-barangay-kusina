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
    <div className="flex flex-col h-96 gap-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-lg text-foreground">Approved Tasks</h2>
        <Button variant="outline" size="sm" disabled>
          Approved
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto border rounded-2xl bg-gray-50 p-4">
        {isLoading ? (
          <p className="text-sm text-gray-600">Loading approved tasks…</p>
        ) : isError ? (
          <p className="text-sm text-red-600">Failed to load approved tasks.</p>
        ) : approvedTasks.length === 0 ? (
          <p className="text-sm text-gray-600">No approved tasks waiting to claim.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {approvedTasks.map((task) => {
              const totalPoints = task.points * task.pendingOrders;
              const totalXp = task.xp * task.pendingOrders;

              return (
                <div
                  key={task.id}
                  className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 grid grid-cols-3 gap-4 items-center"
                >
                  {/* Column 1: Category name & description */}
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{task.name}</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{task.description}</p>
                  </div>

                  {/* Column 2: Instances and approval date */}
                  <div className="flex flex-col gap-1 text-sm text-gray-700">
                    <span className="font-semibold">
                      Instances: {task.completedOrders} / {task.maxOrders}
                    </span>
                    <span className="text-gray-500">Approved on {formatDate(task.approvedAt)}</span>
                  </div>

                  {/* Column 3: Totals + Claim */}
                  <div className="flex items-center justify-end gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {totalPoints} pts · {totalXp} XP
                      </p>
                      <p className="text-xs text-gray-500">Ready to claim</p>
                    </div>
                    <Button
                      onClick={() => handleClaim(task)}
                      disabled={claimMutation.isPending}
                      title="Claim to cook dish"
                      className="bg-accent text-white hover:opacity-90 cursor-pointer"
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
    </div>
  );
}
